# EventDocWorkspace: n named event streams behind one runtime

## Goal

Generalise doccypoccy's eventEditor pattern (one editor experience + one event-doc document)
into a qpq-features feature: a **workspace** of n named event streams, where an editor
experience, a template document, a stylesheet document, and the chrome are all just keyed
streams in one state object, driven by one reducer, through one api.

The single-document editor becomes the one-slot case. Multi-document experiences (edit a
template and its stylesheet side by side, compare two versions, AI authoring across docs)
stop needing bespoke wiring.

## Background: what exists today

In doccypoccy (`packages/exengne/logic/src/modules/eventEditor`):

- `EventEditorState` fuses three things: one document session (`events` + `pendingEvents` +
  coalesce rules + schemaVersion + save machinery), an opaque `experience` slice with a lifted
  reducer, and chrome flags (historyOpen, isLoading, ...).
- `createEventEditorModule` wires shell reducer + lifted experience reducer + apis into one
  runtime, and registers `getApplyEventDocEventActionProcessor` so document verbs work.
- Document verbs never touch state directly. They yield the declarative action:

  ```ts
  export function* askTemplateSetType(templateType: TemplateType): AskResponse<void> {
    yield* askApplyEventDocEvent(TemplateEffect.SetType, { templateType });
  }
  ```

- `askApplyEventDocEvent` already lives in qpq-features (`eventDoc/actions/eventDocEvent`)
  and is deliberately declarative: the verb says WHAT event to apply, a processor in the
  running environment decides HOW.

The limitation: the document session exists exactly once, hard-coded at the top of the state.
There is nowhere to put a second document's log.

## Core design

### 1. Workspace state: keyed streams

```ts
type WorkspaceState = {
  // n named event streams. Some are persisted documents, some are local
  // (editor experience, chrome). The confirmed log per slot.
  history: Record<string, EventDocEvent[]>;

  // Unsaved buffer per slot. The live view of a slot is always
  // [...history[key], ...pending[key]]. Local slots keep this empty.
  pending: Record<string, EventDocEvent[]>;

  // Per-slot runtime state: document identity for document slots
  // ({ serviceName, basePath, id }), isLoading / isSaving / error.
  slots: Record<string, WorkspaceSlotRuntimeState>;
};
```

Snapshots (`snapshots[key][historyIndex] = foldedState`) are deferred. History slots are
append-only so they bolt on later as a fold-cache/replay optimisation without reshaping
anything.

### 2. `askApplyEventDocEvent` is the seam

The action stays exactly as it is. Its interpretation is contextual:

- **Backend**: a registered processor appends to the DB event log (the authoritative save).
- **Frontend workspace**: an inline runtime override routes it into a slot.
- **Anything later** (test harness collecting events, replay/migration tooling) is just
  another interpreter.

This makes leaf domain apis isomorphic: `askTemplateSetType` runs unchanged in a backend
request story, an AI authoring story, or a browser editor. Things are processors in qpq for
dependency injection; the platform overrides some, the runtime overrides some inline. This is
the inline kind.

### 3. `bindWorkspaceApi`: routing via `askOverrideActions`

Leaf verbs stay scope-blind. The bind wraps every verb in an api with
`askOverrideActions` (the same core primitive `askContextProvideValue` is built on),
intercepting `EventDocActionType.ApplyEvent` anywhere in the call chain:

```ts
const boundTemplateApi = bindWorkspaceApi('template', templateApi, /* isPending */ true);
```

- Signature-identical output api.
- The override handler is a closure over `{ slotKey, isPending, validate }`. It consumes the
  ApplyEvent action and runs the commit story directly (no re-yield to a registered
  processor needed on the frontend).
- Nesting is safe: the handler's internal yields are ordinary state-dispatch actions, not
  ApplyEvent, so an outer bind never recaptures. Innermost bind wins.
- Batches work for free: `askOverrideActions` already cracks nested batches, so parallel
  edits across slots route correctly.
- An unbound `askApplyEventDocEvent` on the frontend has no interpreter and fails loudly,
  which is the correct "document verb used outside a workspace" error.

### 4. The commit story

A plain importable story in qpq-features (no dynamic action processor: the only closured
things, validator + slotKey + isPending, live in the bind):

```
askWorkspaceCommitEvent(slotKey, isPending, validate, { eventType, data }):
  read workspace state
  build the event (askNewGuid / askDateNow for provisional metadata, slot schemaVersion)
  validate against the slot's folded view of [...history, ...pending]
    (same validator contract the backend enforces on append; rejection surfaces as
     slot error state, event dropped)
  coalesce against the slot's pending tail (last-write-wins rules), renumber indexes
  dispatch the routed state effect into pending[slotKey] (or history[slotKey] when !isPending)
```

### 5. `createEventDocWorkspace`: the factory

```ts
const { api, reducer, createInitialState, selectors } = createEventDocWorkspace({
  slots: {
    template: {
      kind: 'document',              // api routes to pending; gets save/cancel/dirty
      foldReducer: templateFoldReducer,
      createInitialState: createInitialTemplateState,
      api: templateApi,
      coalesce: [...],
      schemaVersion: TEMPLATE_VERSION,
      validate: validateTemplateEvent,
    },
    style:  { kind: 'document', ... },
    chrome: { kind: 'local', foldReducer: chromeReducer, api: chromeApi },  // api routes to history
  },
});
```

Returns:

- `api`: **keyed, not flattened**. `api.template.askTemplateSetType(...)`,
  `api.chrome.askSetHistoryOpen(...)`. Keying is load-bearing: it lets one domain api mount
  at two keys (`templateA`, `templateB`) with no verb-name collisions. Plus built-ins under
  `api.workspace`: `askInit` (seed document slots with `{ serviceName, basePath, id }`, load
  logs), `askSave` (all dirty slots, or one by key), `askCancel` (discard pending, per slot
  or all), `askRefresh` (tail-pull per slot).
- `reducer`: one runtime reducer with one dumb job: route workspace effects
  (apply/append/set-pending/slot status) into the right keyed slot. The per-slot
  `foldReducer`s never run in the runtime reducer.
- `createInitialState`.
- `selectors`: keyed folds. `selectors.template(state)` folds
  `[...history.template, ...pending.template]` through the slot's foldReducer (core
  `replayEffects`), plus aggregates: `isDirty` (any pending non-empty), `isSaving`,
  per-slot error. Selectors are the one place fold caching lands later (cache the fold at
  the history boundary, refold only the pending tail).

Pending-ness is **slot policy, not a call-site choice**: `kind: 'document'` binds the slot's
api to pending (edit/save/cancel contract), `kind: 'local'` binds straight to history (no
save concept, session-only, never persisted). No parallel `pendingApi`.

### 6. Save

Per-slot streaming save, exactly the semantics of today's `askEventEditorSave`: one event at
a time, each moves pending to saved as it lands, doc stays editable mid-save, interrupted
save leaves only the unsaved tail pending. Slots save independently. Cross-slot ordering
(doc B references doc A that is still a draft) waits until a real case needs it.

### 7. Doccypoccy afterwards

`createEventEditorModule` becomes a thin React shell (EditorShell chrome, runtime naming,
FieldLockProvider) over a one-document-slot workspace. The exengne `eventEditor` module's
logic (buffer/validate/coalesce/save/fold) migrates into the feature; doccypoccy keeps only
the view layer.

## Decisions (settled 2026-07-16)

- **Static slots.** Slot keys are fixed in the workspace definition; the keyed api is fully
  typed via mapped types over the slots config. Dynamic slot mounting is a later extension.
- **Local slots are event streams too.** One mental model: everything is a stream folded on
  read. Growth is managed by aggressive default coalescing on local slots (last-write-wins
  per effect type unless a slot opts out).
- **Workspace owns loading.** `askWorkspaceInit` seeds each document slot's
  `{ serviceName, basePath, id }` and fetches its log; `askRefresh` tail-pulls per document
  slot, with an optional experience refresh hook like today's `refreshExperience`.
- **One workspace-level Save.** Save streams every dirty slot; dirty = any slot dirty.
  Per-slot verbs still exist underneath for custom UIs.

- **History UI is per-slot with a picker** (or opens scoped to the doc that triggered it).
  A merged cross-slot timeline can come later as another view over the same selectors.
- **Feature-provided chrome slot.** eventDocWorkspace exports a standard chrome slot module
  (state, effects, api, fold reducer) that `createEventDocWorkspace` includes by default;
  apps extend or replace it.
- **Backend interpreter already exists.** ApplyEvent already has a backend processor doing
  the DB append, so this plan only adds the frontend workspace interpreter; domain verbs are
  isomorphic from day one.

## Build notes (landed 2026-07-17, in `quidproquo-features/src/eventDoc/workspace/`)

- **Coalesce + renumber moved INTO the reducer** (one atomic `applyEvent` effect,
  reducer closured over per-slot rules). A commit story that read-modify-wrote the
  whole pending array would race under `askRunParallel` (both commits read the same
  buffer, second write clobbers the first). Validation still happens in the commit
  story; the log mutation is atomic.
- **Transport is injected** (`EventDocWorkspaceTransport`: `askFetchEvents` /
  `askAppendEvent` stories). quidproquo-features can't depend on quidproquo-web's
  `askApiRequest`, so doccypoccy passes its existing fetch stories; tests pass fakes.
  Optional on the definition; transport verbs on a transportless workspace fail loudly.
- The bind consumes ApplyEvent inline (no registered processor, no WorkspaceActionType);
  an unbound `askApplyEventDocEvent` on the frontend fails loudly as an unhandled action.
- 22 specs in `createEventDocWorkspace.spec.ts` run the workspace as pure story logic
  under `runStory(askReduceState(...))`: routing, nesting, parallel batches, coalescing,
  lifecycle + domain validation, init/save/refresh/cancel streaming, memoized selectors.

## Tasks

- [x] `EventDocWorkspace` feature skeleton in `quidproquo-features/src/eventDoc/workspace`
      (state types, slot config types, workspace effects enum)
- [x] Workspace reducer (route effects into keyed slots) + `createInitialState`
- [x] `askEventDocWorkspaceCommitEvent` (validate against fold; coalesce/renumber in reducer)
- [x] `bindEventDocWorkspaceApi` on top of `askOverrideActions`
- [x] Fold selectors + aggregates (`isDirty`, `isSaving`, per-slot error)
- [x] Workspace built-in verbs: `askInit`, `askSave`, `askCancel`, `askRefresh`
- [x] Standard chrome slot module (state, events, api, fold reducer), included by default
- [x] Tests via `runStory` + `askReduceState` (commit routing, nesting, batch cracking,
      coalesce, save streaming, validator rejection, selectors)
- [x] `createEventDocWorkspace` factory tying it together, typed keyed api
- [x] Standard `EventDocWorkspaceTransport` (`eventDocWorkspaceApiTransport` in
      `eventDoc/workspace/transport/`), built on `askApiRequest`. To make that possible
      the api action (ApiActionType + askApiRequest + types) moved from quidproquo-web
      to quidproquo-webserver, its rightful home (webserver already defines actions,
      features + actionprocessor-web already depend on it). The enum's string value
      keeps its '@quidproquo-web' prefix for stored-log compatibility. Import sites
      repointed in actionprocessor-web and doccypoccy (no shims).
- [x] Doccypoccy: rebuild renderGroupViewer on the workspace (document + experience
      slots behind the existing EditorShell). Landed as `createWorkspaceEditorModule`
      in design views (the react bridge: runtime atom, module-params init, chrome
      mapping; NO custom action processor — the bind intercepts ApplyEvent), the
      renderGroupViewerExperience module rewritten as a stream slot (events + fold
      reducer instead of effects/actionCreators/stateUpdaters), and the workspace
      created in `renderGroupViewerWorkspace.ts` so view selectors can import its
      fold selectors. Not yet verified in the running app.
- [x] Typed apply: `askApplyEventDocEvent<E>(type, data)` now mirrors
      `askStateDispatchEffect` (an event-doc event IS a special kind of effect), plus
      `EventDocFoldEffects<E>` maps a module's effect union to the fold's stored-event
      shape. Event-doc modules use the standard effects/ + actionCreators/ layout;
      the workspace chrome slot is the canonical example.
- [x] Migrate ALL doccypoccy editors (template, style, layout, content, transformer,
      templateTest, renderGroupViewer, appClient, tenant) to workspaces; exengne
      `eventEditor` module and the design-views EventEditor factory are DELETED
      (still-used asset fetch stories moved to exengne `eventDocFetch`; runtime-name
      hook + toHistoryEntry moved into WorkspaceEditor). Document modules' write verbs
      retyped onto `askApplyEventDocEvent<E>`; fold reducers on `EventDocFoldEffects`.
      Cross-slot flows are wiring-level composites over the bound slot apis (add-content
      + close-dialog, tenant logo upload, transformer add-step + select, templateTest
      run gating). All packages typecheck; not yet exercised in the running app.
- [ ] Doccypoccy: first real multi-slot experience (e.g. template + stylesheet side by
      side) — all machinery now exists; it's a slots-config away

## Later

- Snapshots: `snapshots[key][historyIndex]` for fast replay; fold caching in selectors first.
- Shared open-document store: one session per `serviceName + basePath + id` shared across
  workspaces/tabs, so two editors on the same doc share pending edits.
- Cross-slot save ordering for reference dependencies.
- `askSleep`-style durable authoring stories composing with durable-stories-plan.md.
