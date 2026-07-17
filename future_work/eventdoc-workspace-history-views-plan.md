# Workspace historyViews: fold at write, not at read

## Goal

Stop refolding event logs on every read. The workspace state gains `historyViews`: the
latest folded view of each slot's HISTORY, maintained incrementally by the reducer's
state updaters. The live view is then just the (tiny) pending tail folded onto that
stored base. Stories stop doing getLiveEvents -> fold -> read-a-property; they read the
stored view (+ pending fold when unsaved edits matter).

## Decisions (settled 2026-07-17)

1. **Stream semantics correction: pending = client effects, history = server effects.**
   Local slots (chrome, experience) were wrongly committing straight to history; they
   now commit to PENDING like everything else, and their pending simply never saves
   (they have no documentIdentity, so Save already skips them). History is therefore
   strictly append-only server truth for every slot, which makes the stored fold
   fold-forward-exact: coalescing only ever rewrites pending, never history.
2. **Stored view is the FOLD ACCUMULATOR** (revised 2026-07-17, see below). The
   reducer folds history with the shared per-event step only: the stored view sits at
   the last folded event's schema version, which may be below the slot's latest. The
   migrate-to-latest lives on the READ side: `foldEventDocLiveView` (in eventDoc/fold)
   folds the pending tail with a pending-must-be-authored-at-latest guard, then
   migrates to the latest version at the end; the view selector uses it, so reads are
   always latest-shaped. Pending events at any other version throw at read.

   *Why revised:* the original decision stored the LATEST-migrated view and threw on
   any event below the stored version. That broke a legitimate case: a doc whose whole
   log is authored at an old version (say all v2) inside a slot whose latest is v3.
   Init force-migrated the stored view to v3, and a refresh tail containing another
   perfectly valid v2 event then tripped the below-version guard. Storing the raw
   accumulator folds that tail naturally (the backend already enforces event
   ordering), and the latest shape is recovered once, memoized, at read.
3. **Live view stays computed** (selector/helper folds pending onto historyViews);
   pending churns per keystroke, so it is not stored.
4. **Name: `historyViews`** — `state.historyViews[slotKey]`.

## Consequences adopted with (1)

- `isPending` disappears from the bind, the commit story, and the applyEvent effect:
  ALL applies land in pending. (applyEvent is a session-only state effect; nothing
  durable carries it.)
- `isDirty` counts DOCUMENT slots' pending only (a chrome toggle must not mark the
  workspace dirty). Selector factories already have the slot configs to filter.
- Workspace Cancel keeps clearing document slots only (local pending — tabs, selections
  — survives Cancel, as it should).
- Local-slot LWW coalescing still applies, now to their pending buffer.

## qpq changes

1. `EventDocWorkspaceState.historyViews: Record<string, unknown>`; initial state seeds
   each slot's `createInitialViewState()` (factory passes slot configs, not just keys).
2. `createEventDocWorkspaceReducer(slotConfigs)` — updaters own the fold:
   - `setHistoryEvents` (init): full `foldEventDocLog` (document) / `replayEffects`
     (local, defensively — local history should stay empty) into `historyViews`.
   - `appendHistoryEvent` (each save landing): incremental single-event fold.
   - NEW `appendHistoryEvents` (plural): the refresh tail-pull dispatches this instead
     of set-whole-log, so a refresh folds only the tail.
   - `reset`: initial views.
   - `applyEvent`: pending-only now (coalesce + renumber unchanged).
3. Extract `foldEventDocLogStep(state, event, config)` — the migrate-up / version-routed
   reduce / stamp-updatedAt body — shared by `foldEventDocLog` and the incremental
   updater so semantics can't drift. Step throws on event.version < state.schemaVersion.
4. Selectors: `view` = memoized pending-tail fold over `historyViews[slot]` (no history
   fold at read, ever); `isDirty`/`isSaving` filter to document slots.
5. Story helper: `getSlotHistoryView<TView>(state, slotKey)` (typed read of the stored
   view) alongside the existing `getSlotLiveEvents`.
6. Specs: local commits land in pending; isDirty ignores local pending; incremental
   fold === full refold equivalence; version-below-stored throws; refresh tail folds
   incrementally; save landings fold one-by-one.

## doccypoccy follow-up sweep

- Experience `get<X>ExperienceView` helpers: fold PENDING onto the (initial) view — or
  simply keep `getSlotLiveEvents` (history is empty for locals, so it degrades to the
  same thing).
- Document reads in stories (`fold<Doc>(liveEvents)` and the view selectors): switch to
  `getSlotHistoryView` + pending fold; drop per-read full folds.
- Verify History panel (unchanged: document history), chrome behavior (now in pending),
  Cancel semantics.

## Not doing (yet)

- Per-instance view caches: the slot view selector is a module-level singleton with a
  single-entry identity memo, while runtime atoms are per open document, so two open
  documents thrash the memo. LOW PRIORITY: historyViews IS the real cache and lives in
  each document's own state atom, so a memo miss only re-runs the pending-tail fold +
  a usually-no-op migrate check — microseconds. Only revisit (WeakMap keyed on the
  accumulator) if pending buffers grow large or a migration becomes expensive.

- Storing the pending-folded live view in state (churns per keystroke).
- Validator reads from the stored view (the `(event, events)` contract is shared with
  the backend; a folded-view variant is a later, separate change).

## Tasks

- [x] qpq: pending-only commits (drop isPending), isDirty/Cancel scoping, spec updates
- [x] qpq: historyViews state + fold-owning reducer + foldEventDocLogStep + appendHistoryEvents
- [x] qpq: selectors on historyViews + getSlotHistoryView helper + specs
- [x] doccypoccy: sweep stories/selectors onto the stored views (get<X>LiveDocument helpers,
      experience views fold pending onto stored base, renderGroupViewer reads the stored
      view alone, tenant fold reducer deduped). Still to verify in the running app.
- [x] qpq: Decision 2 revision — stored views become the raw fold accumulator,
      `foldEventDocLiveView` owns the read-side migrate-to-latest, specs reworked to
      accumulator semantics (all-old-version-log scenario replaces the below-version
      throw)
- [x] doccypoccy: revision sweep — get<X>LiveDocument helpers and renderGroupViewer's
      direct read go through `foldEventDocLiveView` with the module's migrations +
      latest version (experience views unchanged: local slots, no migrations)
