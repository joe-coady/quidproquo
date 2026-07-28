# QPQ Store Plan: replace jotai atoms with one refcounted store

## Goal

Kill jotai in quidproquo-web-react. All frontend runtime state lives in a single
redux-like QPQ store keyed by area name:

```
{
  "userprofile:1234": { ...profile state },
  "userprofile:2222": { ...profile state }
}
```

Components bind to an area by name. Binding is refcounted, smart-pointer style:
first bind seeds initial state and runs the definition's onInit story, last unbind
deletes the state. No more module-level atom Maps growing unbounded, no more
mutable `.state` field hack for getState, no more run-on-every-mount mainStory.

## Decisions (locked)

| Question | Decision |
|---|---|
| Store tech | Hand-rolled, no new deps. Plain object of areas, per-area subscribe, useSyncExternalStore in hooks |
| What the store sees | `set_state` only: `setAreaState(area, newState)`. Reduction happens outside, in the binder's reducer. The root store never knows about reducers or what is federated in |
| Cleanup | Immediate delete when bind count hits 0. Accepted consequence: React StrictMode dev double-mount wipes and re-inits on every mount |
| API surface | Redesign freely, migrate all call sites in the same pass, no shims |
| Area keys | The definition field is `uniqueName`; area = `<uniqueName>` or `<uniqueName>:<instanceName>`. Names are the sharing contract (federated modules sharing a name share the area, by design, no collision detection), so they are namespaced by convention: `qpq/admin/*` and `qpq/web-react/*` for framework runtimes, `<service>/<thing>` in consumer apps (docgen: `shell/tabLayout`, `auth/login`, ...), `workspaceEditor/<module>` for the editor factory |
| Bind counts | Internal store bookkeeping, not part of the published state shape |
| Selectors | Selector hooks bind too: they refcount and can trigger onInit. State is alive exactly as long as anyone reads it |
| Init | `onInit` story on the definition, runs on count 0 -> 1 only. The `mainStory` param on useQpqRuntime dies |
| Store access | React context: `QpqStoreProvider` owns the instance, hooks throw without it |
| Zombie writes | `setAreaState` to an unbound area is dropped, with a console.warn in dev |
| Placement | Everything in quidproquo-web-react (store core is pure JS, move down to quidproquo-web later only if a non-react consumer appears) |
| Naming | Keep runtime terminology: createQpqRuntimeDefinition, useQpqRuntime, useQpqRuntimeComputed, QpqRuntimeEffectCatcher |

## Design

### Store core (`src/store/`)

`createQpqStore(): QpqStore`. Internal `Map<area, { count, state, listeners }>`.
Counts and listeners are bookkeeping; only `state` is the published value.

```ts
type QpqStore = {
  hasArea(area: string): boolean;
  getAreaState(area: string): unknown;            // throws or undefined if unbound; hooks guard with hasArea
  setAreaState(area: string, state: unknown): void; // unbound area: drop + dev warn, never resurrect
  bindArea(area: string, initialState: unknown): boolean; // true = first bind (count 0 -> 1), seeds initialState
  unbindArea(area: string): void;                 // count 0: delete entry
  subscribe(area: string, listener: () => void): () => void;
};
```

Invariant: every reader binds (runtime hooks and selector hooks alike), so
count 0 implies no subscribers. Deleting on unbind can never strand a listener.

The store never holds reducers, apis, or definitions. A `set_state` is the only
mutation. This is what keeps module federation trivial: a remote's definition is
just a local handle (reducer + api + initialState + onInit) onto a named channel.

### Runtime definition (`src/runtime/`)

Options object, since the field list has grown:

```ts
const authRuntime = createQpqRuntimeDefinition({
  name: 'auth',                 // required, the area key prefix
  api: authApi,
  initialState: createInitialAuthState(),
  reducer: authReducer,         // QpqBubbleReducer<TState, TAction>, unchanged shape (state, action) => [state, handled]
  onInit: askAuthMain,          // optional, runs once on first bind of an area
});
```

The definition is a plain object now, not a stateful getter function. Area key
derivation: `instanceName ? `${name}:${instanceName}` : name`.

### Binding hook

```ts
const [api, state, dispatch] = useQpqRuntime(authRuntime, instanceName?, getActionProcessors?);
```

Internals:

1. Store from `useQpqStore()` context.
2. Mount effect: `bindArea(area, def.initialState)`. If it returns first-bind and
   `def.onInit` exists, run it through the resolver. Unmount: `unbindArea(area)`.
3. Render reads via `useSyncExternalStore(subscribe, snapshot)` where snapshot is
   `hasArea ? getAreaState : def.initialState` (render can happen before the bind
   effect fires).
4. `dispatch(action)`: run `def.reducer(currentAreaState, action)`. Handled:
   `setAreaState(area, newState)`. Not handled: bubble to the parent dispatch from
   `BubbleReducerDispatchContext`, exactly as today.
5. `getCurrentState` for the StateRead processor reads the store directly. The
   mutable `.state` field hack is gone.
6. Api wrapping (ask-prefix remap, memoized generators, merged state processors
   plus the caller's `getActionProcessors` factory) carries over as-is.

A late `dispatch` from a still-running story after unmount flows into
`setAreaState` on an unbound area and is dropped with the dev warning. Late
bubbling still works if an ancestor catcher is mounted, since bubbling is
context-based, not store-based.

### Selectors

Keep the factory pattern (matches the create-selector convention):

```ts
const selectAuthUsername = createQpqRuntimeComputed(authRuntime, (s) => s.username);
const username = useQpqRuntimeComputed(selectAuthUsername, instanceName?);
```

`useQpqRuntimeComputed` uses the same internal bind machinery as `useQpqRuntime`
(shared internal hook, e.g. `useQpqAreaBinding`): it refcounts, seeds initial
state, and triggers onInit on first bind. It does not wrap the api. Slice
stability: recompute on snapshot change, compare with Object.is, return the
previous slice reference when equal (hand-rolled, same behavior selectAtom gave us).

### Bubbling

Unchanged: `QpqBubbleReducer` returns `[state, handled]`, unhandled actions go to
the parent dispatch via `BubbleReducerDispatchContext`, `QpqRuntimeEffectCatcher`
binds a runtime and provides its dispatch to the subtree. `useBubbleReducer`
(the local-component-state variant) is untouched. Root default stays NOOP.

### Provider

`QpqStoreProvider` creates the store (once, useState initializer) and provides it.
Apps add it at the root alongside the existing providers. `useQpqStore` throws a
clear error when no provider is mounted.

## File layout

`src/hooks/asmj/` is deleted. Replaced by:

```
src/store/
  createQpqStore.ts        QpqStore type + factory (one concept)
  QpqStoreContext.ts
  QpqStoreProvider.tsx
  useQpqStore.ts
  index.ts
src/runtime/
  createQpqRuntimeDefinition.ts
  useQpqAreaBinding.ts     internal shared bind/init hook
  useQpqRuntime.ts
  createQpqRuntimeComputed.ts
  useQpqRuntimeComputed.ts
  bubbleReducer.ts         QpqBubbleReducer type + BubbleReducerDispatchContext
  useBubbleReducer.ts
  QpqRuntimeEffectCatcher.tsx
  QpqMappedApi.ts          unchanged (types + combineQpqApis)
  actionProcessor/         state read/dispatch processors, unchanged behavior
  index.ts
```

## Tasks

### quidproquo-web-react

- [x] `src/store/`: createQpqStore with bind/unbind refcounting, immediate delete on 0, drop + dev-warn on unbound setAreaState, per-area subscribe
- [x] Store tests: refcount lifecycle, first-bind seeding, immediate delete, zombie-write warn, subscriber notify, count-0-implies-no-listeners invariant
- [x] QpqStoreProvider / qpqStoreContext / useQpqStore (throws without provider)
- [x] `src/runtime/`: createQpqRuntimeDefinition (options object, required name, optional onInit, optional getActionProcessors so onInit always runs with the module's processors regardless of which binder is first)
- [x] useQpqAreaBinding: bind/unbind effect, initialState fallback snapshot, first-bind onInit via resolver
- [x] useQpqRuntime: new signature `(def, instanceName?, getActionProcessors?)`, store-backed getCurrentState, dispatch with reduce-then-set_state-or-bubble
- [x] createQpqRuntimeComputed / useQpqRuntimeComputed on the shared binding, Object.is slice stability
- [x] Port QpqRuntimeEffectCatcher, bubbleReducer, useBubbleReducer, QpqMappedApi, actionProcessor/ into `src/runtime/` (QpqContextProvider moved to `src/qpqContext/`, split one export per file)
- [x] Rewrite the asmj tests against the new API; delete `src/hooks/asmj/`
- [x] Remove jotai from quidproquo-web-react package.json and the lockfile
- [x] Update `src/index.ts` exports (QpqStoreProvider is new public surface)
- [x] useQpqWebsocketQueueRuntime follows the new signature (mainStory param dropped)

### quidproquo-web-admin migration

- [x] authRuntime: name 'auth', onInit: askAuthMain; Auth.tsx drops the askAuthMain arg
- [x] adminAppRuntime: name 'adminApp', onInit: askAdminAppMain, getActionProcessors on the definition (not the hook); AdminAppRuntimeMount collapsed into the EffectCatcher
- [x] AuthChallenge* components, MainLayout, useVolatileState, useSessionState, eventDocAiLogChatRuntime (onInit: askEventDocAiLogChatBoot): new signatures
- [x] Mount QpqStoreProvider at the top of App.tsx

### quidproquo-features

- [x] Sweep for createQpqRuntimeDefinition / useQpqRuntime / useQpqRuntimeComputed usage and migrate (none existed; reducers built with buildEffectReducer are unaffected, the [state, handled] contract is unchanged)

### External consumers

- [x] doccypoccy: QpqStoreProvider at the shell root (app-owned store instance in `qpqStore.ts` so imperative snapshot exports can read it), all runtime definitions on the options object with names, mainStory args moved to onInit where safe
- [x] doccypoccy specials: tenantSelector load stays component-triggered (first binders mount pre-auth); workspace editor init stays per-mount (closes over the hot-swap snapshot prop); ShellModule.exportWorkspaceSnapshot now takes the store as a param
- [ ] Other consumer apps (if any) after publish: same recipe

## Landed after the initial cut

- [x] Redux DevTools bridge: `connectQpqStoreToReduxDevTools(store, name)` + `store.getSnapshot()` / `store.subscribeToStore(listener)`. Wired in web-admin ('qpq-admin') and doccypoccy ('docgen'); noop without the extension.
- [x] Time travel: jump/slider, rollback, commit and reset apply recorded snapshots back into the store. Skip/reorder stay disabled (they would need effect replay through the binders' reducers).
- [x] Freeze mode: jumping away from the newest action freezes the store automatically (live set_state dropped, releases deferred at count 0, first binds skip onInit, devtools sends muted); jumping back to head thaws and sweeps unbound areas. Restores while frozen resurrect released areas at count 0, so components popping in mid-scrub render the historical state instead of fetching. The extension's lock button is a manual freeze; COMMIT adopts the on-screen (possibly past) state as the new present. Known leak: app-level mount effects (TenantSelector load, workspace-editor init) still fire their requests on pop-in, but the responses land as dropped writes.

## Later (parked, nothing above blocks these)

- Per-definition retention overrides (keepAlive / ttl) if immediate delete proves too aggressive for things like auth
- Move the store core down into quidproquo-web if a non-react consumer appears
