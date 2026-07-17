# Workspace transient streams: events that were never meant to survive

## The taxonomy (settled 2026-07-18)

- **history** — server-authored truth.
- **pending** — client-authored intent; Save moves it via the server into history.
- **transient** — observations that must never persist: progress messages pushed over a
  websocket ("adding document xyz to zip"), ephemeral status, anything a dead
  connection should be able to take down with it. Dropping a transient key reverts the
  folded view reactively — the event-sourced cure for the forever-spinner.

## Decisions

1. **Shape: per-slot, then per-key.** `transient: Record<slotKey, Record<transientKey, EventDocEvent[]>>`.
   Folds stay per-slot; a drop clears one transientKey across ALL slots (the key is
   usually a websocket connection id — the unit you drop).
2. **Transient events are ordinary EventDocEvents** folded by the slot's own fold
   reducer — a module declares e.g. `zipProgress` in its `effects/` like any other
   effect; only the GROUP holding the event is transient.
3. **Bind-routed apply**: `askApplyTransientEventDocEvent<E>(transientKey, eventType, data)`
   yields a new `EventDocActionType.ApplyTransientEvent` action; the slot bind
   intercepts it like the normal apply, so websocket-handler stories stay scope-blind.
   No backend interpreter — transient applies are client-runtime-only by definition
   (server "authors" them only via messages a client story processes); an unbound or
   backend apply fails loudly like the normal one.
4. **Fold order: `[...history, ...pending, ...transientAll]`** — blocks, transient
   last; transientAll = every key's events merged, ordered by `metadata.createdAt`,
   ties broken by (transientKey, array position) for determinism.
5. **Coalescing: reuse the slot's existing rules within each transientKey's array**
   (the machinery exists; one call in the updater). No new config surface.
6. **No validation on transient commits** — validators guard the integrity of the
   to-be-saved log; transient never saves. Same guid/date/schemaVersion stamping as
   pending (document-slot folds still version-guard at read). CRITICAL invariant:
   `getSlotLiveEvents` (history+pending) is the PERSISTABLE log and stays
   transient-free — validation and History-panel semantics unchanged. New
   `getSlotTransientEvents(state, slotKey)` returns the time-ordered merge.
7. **Drop**: `askUIEventDocWorkspaceDropTransient(transientKey)` clears that key
   across all slots (new effect + updater). Reset clears all transient. Save, Cancel,
   isDirty, isSaving: untouched by transient entirely.

## qpq changes

1. State: `transient` record + initial-state seeding + reset.
2. Action: `EventDocActionType.ApplyTransientEvent` + requester
   `askApplyTransientEventDocEvent<E>(transientKey, eventType, data)` (typed like the
   ordinary apply; same two-arg + explicit-generic rationale).
3. Bind: the override map gains the ApplyTransientEvent handler → a transient commit
   story (stamp metadata, no validation) → new `ApplyTransientEvent` workspace effect
   `{ slotKey, transientKey, event }` → updater appends (with slot coalesce rules
   applied within the key's array; no renumbering — ordering is by time at read).
4. Drop + effects/creators/updaters per conventions (one per file).
5. Read side: `getSlotTransientEvents` (merged + time-ordered, memoized on the slot's
   transient record identity); view selector folds `base + pending + transient` (the
   pending version-guard extends over the transient tail for document slots); memo
   keys gain the transient record.
6. Specs: routing (two keys, two slots), fold order + time-ordering across keys, drop
   reverts the folded view, reset clears, coalesce-within-key, save/cancel/isDirty
   indifference, unbound transient apply fails loudly, liveEvents stays transient-free.

## Later (not this pass)

- Runtime handoff: whatever controls the workspace reads `{ history, pending }` out
  and passes it back into a fresh runtime — needs a read/hydrate verb pair and a
  better name for the concept before building.
- docgen consumers (websocket zip-progress flows) — the feature is forward-looking;
  no app sweep required now.

## Tasks

- [x] qpq: state + action/requester + bind routing + commit story + effects/updaters
- [x] qpq: drop + reset + read-side fold/selectors/helpers
- [x] qpq: specs; lib refresh; docgen typecheck confirmation (no app changes expected)
