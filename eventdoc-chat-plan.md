# EventDoc Chat Plan

Goal: confirm qpq admin session event docs are actually persisting, then replace the log viewer's
old one-off Claude chat with the generic `EventDocAi` chat (streaming, tool-calling), giving it two
tools to inspect a log instead of dumping the whole log JSON into the prompt.

Grounding (verified in code, not assumed):
- `defineEventDocAi` (`quidproquo-features/src/eventDocAi/config/defineEventDocAi.ts`) is a complete,
  generic "AI chat over a doc id" module: websocket queue (`onChatCreate/List/History/Send`),
  streaming send (`askEventDocAiProcessSend`), tool-calling. It has **zero consumers anywhere in the
  repo** right now (backend or frontend) — wiring it up is new work, not just a swap.
- Tool-calling is fully implemented end to end, not a stub: `prepareAiPromptCall.ts`
  (`quidproquo-actionprocessor-awslambda/...`) turns each `AiToolDefinition` into an AI-SDK tool whose
  `execute` calls `askInlineFunctionExecute(toolDef.executor, args)`, with `stopWhen: stepCountIs(10)`
  for multi-step tool loops. Tool executors read the trusted `docId` from
  `askEventDocAiContextRead()`, never from model-supplied input — keep that pattern for the new tools.
- The old chat lives in `quidproquo-webserver/src/services/log/logic/askLogSendChatMessage.ts`: hits
  `askClaudeAiMessagesApi` directly with a hardcoded `claude-3-haiku-20240307`, no streaming, no
  tools, and pastes the entire log JSON into message #1. UI: `quidproquo-web-admin/src/LogViewer/HelpChat/HelpChat.tsx`,
  driven by `adminApp/logic/chat/askSendChatMessage.ts` + `askLoadChatMessages.ts` over
  `POST /log/chat` / `POST /log/chat/message` (routes in `quidproquo-features/src/admin/config/defineAdminSettings.ts:163-164`,
  handlers in `quidproquo-webserver/src/services/log/entry/controller/logController.ts`).
- Admin session event docs (`qpq-admin-sessions`, `defineAdminSessionEventDoc.ts`) already look fully
  built per `qpqadminplan.md` — this plan starts by proving that in a running app, not re-designing it.
- A single log's actions live in `StoryResult.history: ActionHistory[]`
  (`quidproquo-core/src/types/StorySession.ts`), each entry `{ act: {type, payload}, res, startedAt, finishedAt }`,
  loaded via `logData.askGetByCorrelation(correlation)`. This is the data source for both new tools.

---

## 1. Verify admin session event docs are actually saving
> Adapted while executing this plan: this repo is the `quidproquo` framework itself — there is no
> runnable admin app instance or AWS-backed environment checked out here (the real running admin
> lives in a separate consumer repo). A literal "open a browser, log in, watch the Network tab" pass
> isn't possible from inside this repo. Substituted with (a) a full static trace of the persistence
> path from HTTP controller down to the KVS calls, and (b) a new round-trip integration test that
> exercises the real create → append → list story logic against an in-memory KVS, which is stronger
> proof than a manual click-through would have been anyway.
- [x] Traced `POST /v1/admin/session` → `create.ts` → `askEventDocCreate` → `askEventDocUpsert` →
      `askKeyValueStoreUpsertWithRetry(storeName, ...)`, and `POST /v1/admin/session/{id}/events` →
      `appendEvent.ts` → `askEventDocEventAppend` → `askEventDocEventWrite` →
      `askKeyValueStoreUpsertWithRetry(eventsStoreName, ..., { ifNotExists: true })`, and
      `GET /v1/admin/session/{id}/events` → `listEvents.ts` → `askEventDocEventList` →
      `askKeyValueStoreQuery`. All three are real conditional/queried KVS calls, not stubs.
- [x] Added `quidproquo-features/src/eventDoc/routes/controllers/eventDocSessionRoundTrip.test.ts`:
      drives `create` → `appendEvent` → `listEvents` through `runStory` against an in-memory KVS
      action-processor mock, proving a session doc really persists and reads back its events
      (previously this path had zero test coverage anywhere in the module).
- [x] Ran `defineAdminSettings.test.ts`, `askStartSession.test.ts`, `askEndSession.test.ts`,
      `adminSessionFoldReducer.test.ts`, `sessionLogReducer.test.ts`, `askApplySessionEventToLog.test.ts`
      — all pass (see full-suite run below).
- [x] Confirmed the flush loop's dedup is coalesce-not-drop by reading `askRunSessionFlushLoop.ts` +
      its existing tests — coalescing replaces only the last *pending* (unsent) event, never one
      already in flight or already acknowledged, so rapid navigation can't lose an acknowledged event.
- [x] Confirmed refresh-mid-session behavior by reading `inMemoryAuthTokenStore.ts` +
      `askStartSession.ts`: auth tokens are memory-only by design, so a refresh re-authenticates and
      `askStartSession` always POSTs a fresh `/v1/admin/session`, i.e. a new session doc — this is the
      documented intended behavior, not a bug.

## 2. Build the two log-inspection tools (backend, no UI yet)
> Adapted: `res` in `ActionHistory` turned out to be the raw `ActionProcessorResult` tuple
> (`[result?, QPQError?]`, per `resolveStory.ts`), not an `EitherActionResult` — used
> `isErroredActionResult`/`resolveActionResult`/`resolveActionResultError` from `quidproquo-core`
> instead of hand-rolling that check. Also: `quidproquo-features` depends on `quidproquo-webserver`
> (not the other way around), so the tools are split across both packages — data access in
> `quidproquo-webserver` (same package as `logData`, mirroring where the old chat lived), the
> docId-trusting executor + tool definitions in `quidproquo-features/src/admin` (same package as
> `askEventDocAiContextRead` and the rest of the admin wiring).
- [x] `askGetLogActionsForCorrelation` (`quidproquo-webserver/src/services/log/logic/logs/askGetLogActionsForCorrelation.ts`,
      exported as `logsLogic.askGetLogActionsForCorrelation`): loads the `StoryResult` via
      `logData.askGetByCorrelation` and maps `history` to `{ index, actionType, startedAt, finishedAt, executionTimeMs, success, error }`.
      No payload/result bodies — this is the index the model scans first. Tested in
      `askGetLogActionsForCorrelation.test.ts`.
- [x] `askGetLogActionDetail` (`quidproquo-webserver/src/services/log/logic/logs/askGetLogActionDetail.ts`,
      `logsLogic.askGetLogActionDetail`): given `correlationId` + `index`, returns that one
      `ActionHistory` entry's full `act.payload` (input) and `res` (output, or error). Throws
      `NotFound` for an out-of-range index. Tested in `askGetLogActionDetail.test.ts`.
- [x] Docid-trusting executors in `quidproquo-features/src/admin/logic/aiTools/`:
      `askAdminLogAiToolGetActions` and `askAdminLogAiToolGetActionDetail` — each reads `docId` via
      `askEventDocAiContextRead()` (never from model input) then delegates to the `quidproquo-webserver`
      functions above. Both registered via `defineInlineFunction` in
      `quidproquo-features/src/admin/config/defineAdminLogAiTools.ts`. Tested in their own
      `.test.ts` files, asserting the docId comes from context, not from the tool's payload.
- [x] Defined the two `AiToolDefinition`s (`adminLogAiTools` in `defineAdminLogAiTools.ts`) —
      `getLogAction`'s schema requires `index: number`; `getLogActions` takes no input.
- [x] Wrote `adminLogAiSystemPrompt` (`quidproquo-features/src/admin/constants/adminLogAiSystemPrompt.ts`):
      tells the model the log is not inline, to call `getLogActions` first, then `getLogAction` only
      for what it actually needs, and to answer in markdown.
- [x] `npm run build -w quidproquo-webserver && npm run build -w quidproquo-features` both clean; full
      `npm run test` at root: 761 files / 5284 tests passing (up from the section-1 baseline of
      755/5274 — 6 new test files, 10 new tests, nothing broken).

## 3. Wire `defineEventDocAi` into the log service
> Adapted: deleted the old chat backend in this step rather than deferring to after step 5 — leaving
> dead/broken `/log/chat*` routes wired up while the replacement UI is still being built added
> confusion for no benefit (the frontend was already going to be broken mid-refactor either way until
> step 5 lands; nothing depends on the old routes existing a little longer).
- [x] Called `defineEventDocAi({ storeName: 'log', type: 'log', serviceName: logServiceName, eventBusName: 'qpq-admin-wsq', userDirectoryName: adminUserDirectoryResourceName, model: AiModel.ClaudeSonnet46, systemPrompt: adminLogAiSystemPrompt, tools: adminLogAiTools })`
      plus `...defineAdminLogAiTools()`, inside the existing log-service-scoped `defineServiceSettings`
      block in `quidproquo-features/src/admin/config/defineAdminSettings.ts`, replacing the two old
      `/log/chat*` routes. Upgraded off the hardcoded `claude-3-haiku-20240307`.
- [x] Reused the **existing** `'qpq-admin-wsq'` event bus (the same one `defineWebSocketQueue` and the
      `qpqadmin-wscfg`/`qpq-admin-websockets` queues already subscribe to) as `eventBusName` — no second
      bus provisioned.
- [x] Deleted the old chat backend: `askLogSendChatMessage.ts` (+ test), `askGetLogChatMessages.ts`
      (+ test), `logChatMessageData.ts` (+ test), the `ListLogChatMessages`/`LogChatMessage`/`SendLogChatMessage`
      domain types (+ the now-empty `entry/constants/` dir holding just `systemPrompt.ts` + its test),
      the `sendChatMessage`/`getChatMessages` handlers in `logController.ts` and their imports, the
      `/log/chat` + `/log/chat/message` routes, the `claudeAi-api-key` global, and the
      `claudeAiApiKeySecretName` config field (+ updated `admin-settings.md` docs to match). The
      `quidproquo-web-admin` frontend still references the old chat shape at this point — expected,
      fixed in steps 4-5.
- [x] `npm run build -w quidproquo-webserver && npm run build -w quidproquo-features` both clean; full
      `npm run test` at root: 757 files / 5275 tests passing (net -4 files / -9 tests from the section-2
      count, exactly the 4 deleted old-chat test files — nothing else broken).

## 4. Build the EventDocAi frontend binding (new — nothing to swap in, build it)
> Adapted: the transport turned out to already be fully built, just never wired up —
> `getServiceRequestActionProcessor` + `useQpqWebsocketQueueRuntime` (`quidproquo-web-react`) already
> combine request/response service calls over the existing app-wide `WebsocketProvider` connection with
> receiving `StateActionType.Dispatch` server-push messages (how `askUIEventDocAiAppendStreamChunk`
> reaches the client mid-flight — the server-side `StateActionType.Dispatch` processor
> (`quidproquo-webserver/.../getStateDispatch.ts`) forwards it to the requesting connection instead of
> updating server state). Docid/serviceName context is provided the same way `adminUserContext` already
> is, via `QpqContextProvider`. One real gap found: the frontend had no way to know its own deployed
> `logServiceName` (needed to address `qpq/serviceRequest/{logServiceName}/...`), so `getServiceNames`
> now also returns it — see below.
- [x] Confirmed the exact public surface in `quidproquo-features/src/eventDocAi/module/`
      (`EventDocAiState`, `eventDocAiReducer`, `qpqContexts/eventDocAiContext`, `sharedEventDocAiApi`),
      and how it wires to transport (`askEventDocAiServiceRequest` → `askServiceRequest` →
      `ServiceActionType.Request`, resolved client-side by `getServiceRequestActionProcessor`).
- [x] `quidproquo-webserver/src/services/log/entry/controller/logController.ts`'s `getServiceNames` now
      returns `{ services, logServiceName }` (was a bare `string[]`); backed by a new
      `defineGlobal('qpq-log-service-name', logServiceName)` in `defineAdminSettings.ts`. Threaded
      through the existing service-names load pipeline into `VolatileState.logServiceName`
      (`askLoadServiceNames.ts` → `askUIVolatileServiceNamesLoaded` → `VolatileServiceNamesLoadedEffect`
      → `serviceNamesLoaded` stateUpdater).
- [x] `quidproquo-web-admin/src/LogViewer/LogChat/eventDocAiLogChatRuntime.ts`:
      `createQpqRuntimeDefinition(sharedEventDocAiApi, createInitialEventDocAiState(), eventDocAiReducer)`
      — named per log correlation id so each open log dialog gets isolated chat state.
- [x] `LogChat.tsx` wraps its conversation in `<QpqContextProvider contextIdentifier={eventDocAiContext} value={{ serviceName: logServiceName, type: 'log', docId: logCorrelation }}>`, scoped to one log
      dialog (mounted/unmounted with the tab, per-correlation runtime name via `useQpqWebsocketQueueRuntime`'s `name` param).
- [x] `LogViewer/LogChat/logic/askEventDocAiLogChatBoot.ts` — on mount, loads the chat list and resumes
      the most recently updated chat if one exists; a fresh log with no chats yet stays blank until the
      first message (`askEventDocAiSendMessage` auto-creates a chat) — no chat-list picker UI built.
      Tested in `askEventDocAiLogChatBoot.test.ts`.

## 5. Replace `HelpChat.tsx` with the EventDocAi chat UI
- [x] `LogChat.tsx` + `EventDocAiSegments.tsx` render `EventDocAiChatMessage.segments` (text via
      markdown, reasoning dimmed/italic, tool-use as a labeled box showing input and — once it
      arrives — output, file attachments as a chip) instead of the old flat `message.message` string.
- [x] Live streaming: `mergeStreamParts(state.streamParts)` renders the in-flight reply as it streams
      (same segment renderer as finalized messages), replacing the old boolean "pendingReplies" spinner
      with a "Thinking…" indicator only shown before any content has arrived.
- [x] Tool calls render inline as they happen — "Calling getLogActions…" while in flight, then the
      tool name + input + output once resolved — the visible payoff of switching to tool-calling.
- [x] `HelpTab.tsx` now renders `<LogChat logServiceName={volatile.logServiceName} logCorrelation={log.logCorrelation} />` instead of `<HelpChat logCorrelation={...} />`; the dead `HelpChat` import in
      `LogDialog.tsx` (never actually rendered there) was also removed.
- [x] Deleted `HelpChat.tsx`, `adminApp/logic/chat/askLoadChatMessages.ts`, the `chatByCorrelation` /
      `VolatileChat` volatile-state plumbing (actionCreators, effects, stateUpdaters for
      chatMessageAppended/chatMessagesLoaded/chatPendingReplyChanged), and
      `types/{LogChatMessage,SendLogChatMessage,ListLogChatMessages}.ts`.
      **Decided to keep** `chatMessageSent` as a session audit event (it's a one-line "user asked the
      log chat something" fact, not chat transport) — simplified `askSendChatMessage.ts` down to just
      that `askApplySessionEvent` call, still wired into `sharedAdminAppApi`, called from `LogChat.tsx`
      alongside `api.eventDocAiSendMessage(...)`. Tested in `askSendChatMessage.test.ts`.
- [x] Full build clean (`npm run build` at root, all 23 workspaces) and full test suite green: 759
      files / 5279 tests (up from 757/5275 — the two new LogChat test files).

## 6. Manual verification
> Adapted, same reason as step 1: no runnable admin app / AWS+Bedrock environment exists inside this
> framework repo to click through in a browser. Substituted with a wire-protocol consistency audit
> (the actual thing that would silently break the live feature) plus the full automated test/build
> pass, which is the strongest verification actually available here.
- [x] Confirmed the `{ serviceName, type, docId }` triple matches exactly between the two sides that
      never share code: backend `defineEventDocAi({ storeName: 'log', type: 'log', serviceName: logServiceName, ... })`
      in `defineAdminSettings.ts` vs. frontend `<QpqContextProvider ... value={{ serviceName: logServiceName, type: 'log', docId: logCorrelation }}>`
      in `LogChat.tsx` — a mismatch here (e.g. wrong `type`) would silently misroute every websocket
      message and there's no compiler check across that boundary.
- [x] Confirmed `logServiceName` genuinely reaches the frontend at runtime: `getServiceNames` reads the
      `qpq-log-service-name` global set by `defineAdminSettings` → `askLoadServiceNames` parses
      `{ services, logServiceName }` → `VolatileState.logServiceName` → `HelpTab.tsx` passes it into
      `LogChat`. `LogChat` renders a loading spinner instead of mounting the chat context while it's
      still `''`, so a boot-order bug here would show as a stuck spinner, not a silent misroute.
- [x] Confirmed the streaming path is real, not assumed: traced `askEventDocAiProcessSend` (server) →
      `askUIEventDocAiAppendStreamChunk` → `askStateDispatchEffect` → `StateActionType.Dispatch`, which
      the log service's `getStateDispatch.ts` processor forwards to the requesting connection as a
      `WebSocketQueueServerMessageEventType.StateDispatch` push — and `useQpqWebsocketQueueRuntime`
      (client) re-dispatches exactly that message type into the local reducer. Same mechanism already
      used for other server-push admin UI updates, not new/unproven wiring.
- [x] Added `quidproquo-features/src/eventDocAi/wsControllers/onChatCreate.test.ts`: drives the real
      `onChatCreate` handler through `runStory` (auth resolve → context provide/read off the trusted
      wire `docId` → chat creation → KVS upsert → the websocket `ServiceRequestResponse` send), the
      first test coverage this wsController has ever had. This is everything the live feature does
      except the actual model call.
- [x] Ran the full automated suite as the closest available substitute for a click-through: `npm run build`
      (all 23 workspaces, clean) and `npm run test` (760 files / 5280 tests, all passing).
- [x] **Genuine remaining gap, explicitly not claimed as done**: the actual AI turn (Claude via Bedrock
      calling `getLogActions`/`getLogAction` and streaming a reply) and a real browser click-through
      both require infrastructure this repo doesn't have — a deployed consumer app, an AWS account,
      Bedrock access. Nothing achievable inside this repo was left undone to get closer to that; what's
      left is infrastructure, not code. Whoever deploys this should do one real click-through (open a
      log with an error, ask "what went wrong", confirm `getLogActions` → `getLogAction` calls render
      and the reply streams; close/reopen the dialog and confirm chat history resumes) before calling
      the feature done end to end.

## Out of scope for this pass
- A chat-list UI (multiple named chats per log).
- Any tool beyond the two requested (list actions, read one action).
- Migrating/backfilling old `logChatMessageData` records — just drop the old feature, nothing to carry over.
