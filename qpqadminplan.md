# QPQ Admin Rewrite — Session Event-Doc State

## Context

`quidproquo-web-admin` currently spreads state across per-feature asmj runtimes, ad-hoc `useState`, imperative fetch helpers, and URL query params as source of truth, with auth tokens persisted to localStorage (`askConfigSetParameter('authToken', ...)`).

Rewrite so that **the entire app state (except auth) is a per-login "session" event doc**, persisted server-side for audit. Login creates the doc; every user-intent action appends an event; session state is a pure fold of the log. All state logic becomes pure (effects enum → pure stateUpdaters → reducer; `ask*` generators; selectors), modeled on the doccypoccy module pattern. Existing admin endpoints stay unchanged — new session routes come free from `defineEventDoc`.

Decisions made with the user:
1. **Persistence** via `quidproquo-features` eventDoc (`defineEventDoc`) — client batches pending events, POSTs to the auto-wired append endpoint.
2. **Auth stays outside the event doc** — login/challenge/refresh flow roughly as today, but tokens are **in-memory only** (no localStorage). Page refresh ⇒ re-login ⇒ new session.
3. **Session vs volatile split** — user-intent events go in the doc; loading flags, in-flight network, fetched response payloads live in a volatile slice outside the fold. Request intent is an event; response data is volatile cache keyed by the request params.
4. **Rewrite in place** in `quidproquo-web-admin`; existing MUI screens rewired onto the new state.

**The frontend keeps rendering and working at every phase.** This is a state-layer rewrite, not a UI rebuild: all existing screens/components (MainLayout, LogSearch, AdminLogs, Dashboard, Config, HelpChat) are kept and rewired one phase at a time. After every phase the admin runs in the dev-server and is manually testable end-to-end — screens not yet migrated keep running on their old runtimes until their phase. Alongside that, the pure fold reducer gets unit tests that assert state transitions directly (event list in → expected session state out), so transitions are verifiable without the UI too.

Verified building blocks (all in this repo):
- `quidproquo-features/src/eventDoc/` — `defineEventDoc({storeName, type, basePath, routeAuthSettings})` = summary KVS + append-only events KVS + versioned routes (`POST /v1{base}`, `POST /v1{base}/{id}/events`, `GET .../events`, ...). Append (`logic/askEventDocEventAppend.ts`) gives clientMessageId dedup, version monotonicity, optimistic-concurrency retry. Pure fold: `buildEventDocFoldReducer` / `foldEventDocLog` in `fold/`.
- `quidproquo-core/src/logic/stateEffects/` — `buildEffectReducer`, `combineQpqReducers`, `askStateDispatchEffect`, `replayEffects`.
- `quidproquo-web-react/src/hooks/asmj/useQpqRuntime.ts:25` — 4th arg `getActionProcessors: (dispatch, getCurrentState) => ActionProcessorListResolver` is the seam for a custom ApplyEvent processor. Selectors via `createQpqRuntimeComputed`/`useQpqRuntimeComputed`.
- localStorage removal point: `quidproquo-web-admin/src/platformLogic/config/askSaveAuthToken.ts` / `askLoadAuthToken.ts` (both have tests).
- Testing: `runStory`/`mockActions`/`expectSuccess` in `quidproquo-core/src/testing/storyTesting.ts`; vitest at repo root.

Dependency facts: `quidproquo-features` depends on `quidproquo-webserver` (not vice-versa) — so the session collection is a **features-level helper** added by the consuming service's config, not part of `defineAdminSettings`. `quidproquo-web-admin` must gain a dep on `quidproquo-features` (fold/models are browser-safe; doccypoccy already does this).

## Backend: `adminSession` feature — part of `defineAdminSettings`

The session store is an **admin thing**: it must come from `defineAdminSettings`, not per-consumer wiring. Dependency direction blocks doing it in webserver directly (`quidproquo-features` → `quidproquo-webserver`, and `defineEventDoc` lives in features), so **`quidproquo-features` becomes the owner of the full admin definition**: it exports its own `defineAdminSettings` (same signature) that spreads the webserver base and adds the session event doc. Consumers switch one import (`quidproquo-webserver` → `quidproquo-features`) and get sessions automatically.

New folder `quidproquo-features/src/adminSession/`:

```
adminSession/
  config/
    defineAdminSettings.ts               // THE admin entry point going forward (define* returns QPQConfig only)
    defineAdminSessionEventDoc.ts        // internal: the session collection
  constants/adminSessionConstants.ts     // storeName 'qpq-admin-sessions', type 'adminSession', basePath '/admin/session'
  index.ts                               // + export from quidproquo-features/src/index.ts
```

```ts
// defineAdminSessionEventDoc.ts — scoped to the log service like the other admin-only resources
export const defineAdminSessionEventDoc = (logServiceName: string): QPQConfig => [
  defineServiceSettings({
    [logServiceName]: defineEventDoc({
      storeName: 'qpq-admin-sessions',
      type: 'adminSession',
      basePath: '/admin/session',
      routeAuthSettings: { userDirectoryName: adminUserDirectoryResourceName }, // 'qpq-admin'; export from quidproquo-webserver index if not already
    }),
  }),
];

// defineAdminSettings.ts — same signature as the webserver one it wraps
export const defineAdminSettings = (logServiceName: string, rootDomain: string, advancedSettings?: QPQConfigAdvancedLogSettings): QPQConfig => [
  ...defineWebserverAdminSettings(logServiceName, rootDomain, advancedSettings), // base from quidproquo-webserver
  ...defineAdminSessionEventDoc(logServiceName),
];
```

The webserver `defineAdminSettings` stays as the base implementation (its `__dirname`-relative queue entry points can't move packages); document in `breaking-changes.md` that consumers should now import `defineAdminSettings` from `quidproquo-features`.

Session lifecycle:
- **Create at login**: `POST /v1/admin/session` `{ name: '<username> — <loginIso>', code: <guid> }` → `EventDocSummary`; its `id` anchors the session.
- **Appends**: batched `POST /v1/admin/session/{id}/events` with `{ type, payload: { data, metadata: { version: 1, clientMessageId } } }`; server stamps createdBy/createdAt/index.
- **End**: `sessionEnded` event on logout (best-effort drain before clearing tokens). Tab-close abandonment is fine — last event timestamp is the effective end.

## Client architecture — `quidproquo-web-admin/src/adminApp/`

Root state = `{ sessionLog, volatile }`. The folded session is **never stored** — derived in a memoized selector over `[...events, ...pendingEvents]`.

```
adminApp/
  AdminAppState.ts / adminAppReducer.ts (combineQpqReducers) / adminAppRuntime.ts / adminApi.ts
  session/
    AdminSessionState.ts
    events/  AdminSessionEventType.ts (enum, camelCase members) + Effect<Type,Payload> types + coalesceEventTypes.ts
    fold/    stateUpdaters/ (pure, one per file) + adminSessionFoldReducer.ts (buildEventDocFoldReducer)
    selectors/  selectSessionState.ts (memoized fold), selectSearchParams, selectTab, selectOpenCorrelation, selectUrlProjection
  sessionLog/  SessionLogState { docId, events, pendingEvents, flush } + effects (docCreated, eventAppended, flushStarted, eventsSaved, flushFailed) + reducer
  volatile/    VolatileState { logResults[hash(params)], realtimeErrorLogs, logDetail, chatByCorrelation, serviceNames, loadingCount } + effects + reducer
  actions/     AdminSessionActionType { applyEvent } + getApplySessionEventActionProcessor.ts  ← the pure/IO seam
  logic/       askAdminAppMain, askStartSession, askEndSession,
               search/askRunSearch, logDetail/askLoadCorrelation|askLoadChildren|askToggleLogChecked,
               chat/askLoadChatMessages|askSendChatMessage, config/askRequestConfigSync|askLoadServiceNames,
               url/askProjectSessionToUrl
  hooks/       useAdminApp (useQpqRuntime + processor factory), useSessionState, useVolatile
  AdminAppProvider.tsx  // mounted inside Auth in src/App/App.tsx
```

### Event catalog (`AdminSessionEventType`)

| Event | Payload | Coalesced |
|---|---|---|
| `sessionStarted` | `{ username, seededParams, userAgent? }` | no |
| `tabChanged` | `{ tab, tabName }` | yes |
| `searchParamsChanged` | `{ search: AdminSearchParams }` (full snapshot) | yes |
| `searchRequested` | `{ search, requestId }` | no |
| `correlationOpened` / `correlationClosed` | `{ correlationId, source? }` | no |
| `logCheckToggled` | `{ correlationId, checked }` | no |
| `configServiceSelected` | `{ service }` | yes |
| `configSyncRequested` | `{}` | no |
| `chatMessageSent` | `{ correlationId, message }` | no |
| `sessionEnded` | `{ reason: 'logout' }` | no |

`AdminSearchParams` = today's URL params from `src/queryParams/searchQueryParams.ts` (runtimeType, service, startIsoDateTime, endIsoDateTime, user, info, msg, error, deep, logLevel).

### ApplyEvent seam (optimistic append + batched flush)

`askApplySessionEvent(type, data)` yields one custom action `{ type: applyEvent, payload }`. Its processor (registered via `useQpqRuntime`'s 4th arg) builds the `EventDocEvent` with local metadata (`clientMessageId` guid), dispatches `SessionLogEffect.eventAppended` (optimistic), and schedules a debounced (~500ms trailing) flush.

- **Coalescing** in the pure `applyEventAppended` updater: if type ∈ coalesceEventTypes and last **pending** event has same type, replace in place (acked events immutable).
- **Flush** is a module-level singleton, **strictly serial**: POST `pendingEvents[0]`, on 2xx dispatch `eventsSaved` (move to `events` with server metadata), repeat. On failure: exponential backoff retry with the **same clientMessageId** (server dedup depends on serial one-at-a-time — do not parallelize). Reads current bearer token per POST, so mid-session refresh just works.

### URL seeding + one-way projection

- **Boot** (`askAdminAppMain`, after login): `askQueryParamsGetAll()` → `seededParams` → create doc → `sessionStarted { seededParams }` (+ `correlationOpened { source: 'deepLink' }` if seeded) → start flush loop.
- **After boot** URL is a projection: session-event `ask*` stories end with `askProjectSessionToUrl()` (from `selectUrlProjection`, via existing `askQueryParamsSet` / web action processor). Back/forward becomes inert (acceptable; popstate→events is a later enhancement).
- Delete `src/queryParams/` (`useUrlFields.ts`, `searchQueryParams.ts`) and `sharedQueryParamsRuntime` usage at the end.

### Auth changes

- New `src/platformLogic/config/inMemoryAuthTokenStore.ts` (module-scoped holder); reimplement `askSaveAuthToken`/`askLoadAuthToken` over it — same names/signatures, zero `askConfigGet/SetParameter` calls. Update their tests.
- `askAuthMain` no longer restores a token on boot. Refresh loop (`askRunRefreshTokensLoop.ts`) unchanged. Token refresh is **not** a session event (machine housekeeping; server logs `/refreshToken` anyway).
- `askAuthLogout`: first `askEndSession` (append `sessionEnded`, drain with timeout), then clear in-memory token + auth state.
- Session creation is triggered by `AdminAppProvider` mounting inside `Auth` (renders only when authenticated), not by `askAuthLogin`. Username via qpq context or login response.
- `WebSocketAuthProvider`/`useAuthAccessToken` unchanged (they read React context, not localStorage).

## Screen migration

| Screen | Session fold | Volatile | Notes |
|---|---|---|---|
| MainLayout/tabs | `tabChanged` | — | Logout → `endSession` then auth logout |
| LogSearch | field edits → `searchParamsChanged` (coalesced); Search → `searchRequested` | `logResults[hash]`, progress | port `getLogs.ts`/`searchLogs.ts` into `askRunSearch` (askPlatformRequest POST `/log/list` paging loop) |
| AdminLogs | `correlationOpened/Closed`, `logCheckToggled` | `logDetail` cache | reuse pure `filterLogs`/`createHierarchy`; toggle call moves into `askToggleLogChecked` |
| Dashboard | mount fires `searchRequested` (recorded, so replay explains the fetch) | `realtimeErrorLogs` from websocket `LogMetadata` pushes | |
| Config | `configServiceSelected`, `configSyncRequested` | `serviceNames` | websocket send stays in glue hook alongside the event |
| HelpChat | `chatMessageSent` (user text only) | `chatByCorrelation` incl. AI replies | `/log/chat` + `/log/chat/message` become ask* logic |
| Federated addons | opening = `tabChanged` | addon-owned | expose `useSessionState`/apply through addon context for later opt-in |
| Auth screens | untouched except token storage + logout | — | |

## Implementation phases (each leaves the app working)

**Phase 0 — Backend collection**: create `quidproquo-features/src/adminSession/` with the wrapping `defineAdminSettings` + `defineAdminSessionEventDoc`; export admin directory resource name from `quidproquo-webserver` index if needed; note the import-path change for consumers in `breaking-changes.md`.

**Phase 1 — In-memory auth**: `inMemoryAuthTokenStore.ts`; rewrite `askSaveAuthToken`/`askLoadAuthToken`; simplify `askAuthMain` (no restore); stub `askEndSession` in logout. Update tests.

**Phase 2 — adminApp skeleton**: add `quidproquo-features` dep to `quidproquo-web-admin`; build the full `src/adminApp/` tree (state, events, fold, sessionLog/volatile reducers, ApplyEvent processor + flush engine, boot/end stories, selectors, hooks); mount `AdminAppProvider` inside `Auth` in `App.tsx`. Old screens still run on old state; the doc records `sessionStarted` only. Unit tests: fold replay determinism, coalescing, `runStory` tests for start/end stories.

**Phase 3 — Navigation + URL projection**: rewire MainLayout tabs to `applyTabChanged`; add `askProjectSessionToUrl`; boot seeding for `tab`.

**Phase 4 — LogSearch + AdminLogs** (the bulk): port search fetch logic to `askRunSearch`; wire search bar fields/buttons; grids read volatile cache keyed by session search params; correlation drill-down + `logCheckToggled`; verify deep-link seeding.

**Phase 5 — Dashboard, Config, HelpChat, addons** per the table.

**Phase 6 — Logout + deletion sweep**: finish drain-on-logout ordering; delete `src/queryParams/`, superseded `src/LogViewer/logic/{getLogs,searchLogs,login,refreshTokens,respondToAuthChallenge}.ts` (verify no imports), unused hooks (`useOnSearch`, `useLogSearch`), per-screen state remnants. Sweep: `grep -rn "askConfigSetParameter\|askConfigGetParameter\|sharedQueryParamsRuntime" quidproquo-web-admin/src` must return nothing.

## Verification (commands for the user — implementer does not run builds)

Pure-logic: `npx vitest run quidproquo-web-admin` (fold replay: same event list ⇒ deep-equal state; coalescing collapses consecutive `searchParamsChanged`; `runStory` + `mockActions` for `askStartSession`/`askRunSearch`/`askEndSession`), `npx vitest run quidproquo-features` (config-shape test, pattern: `defineAdminSettings.test.ts`).

End-to-end (user runs): `npm run watch-all`, then `cd quidproquo-dev-server && npm run start`, open `/admin`:
1. Login → Network shows `POST /v1/admin/session` then batched `POST /v1/admin/session/{id}/events`.
2. Drive the UI → `GET /v1/admin/session/{id}/events` shows the ordered log; rapid typing yields one coalesced `searchParamsChanged` per flush window.
3. Replay: fold the fetched events with `adminSessionFoldReducer` in a test fixture — matches UI state.
4. localStorage stays empty of `authToken`; refresh forces re-login + a new session doc in `GET /v1/admin/session`.
5. Token refresh still fires and appends keep working.
6. Deep link `/admin?tab=1&correlation=<id>` → `sessionStarted.seededParams` contains them, dialog opens, URL keeps projecting.
7. `npm run lint`.

## Risks / follow-ups

1. **No TTL on eventDoc stores** — sessions accumulate forever; follow-up: optional retention on `defineEventDocSummary`, aligned with `qpq-log-retention-days`.
2. **Actor resolution** — verify `createdBy` resolves correctly against the `qpq-admin` directory in dev-server.
3. **Fold cost on long sessions** — memoized fold is fine at admin scale; incremental fold (cache last state + apply new events) is a ready optimization inside `selectSessionState`.
4. **Back/forward inert** post-rewrite; popstate→events is a possible Phase-3+ enhancement.
5. **Consumers must switch their `defineAdminSettings` import to `quidproquo-features`** — the admin UI hard-depends on the session routes at login; deployments still importing the webserver one won't have them. Document in `breaking-changes.md`; consider a "continuing un-audited" fallback only if required.
6. Keep `quidproquo-features` imports in the admin to top-level (browser-safe) exports; watch bundles for node-only leakage.
