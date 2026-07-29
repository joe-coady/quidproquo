import { EventDocDocument, EventDocEvent } from '../models';
import { createEventDocAcceptance } from './acceptEventDocEvent';
import { foldEventDocLogStep, FoldEventDocLogStepConfig } from './foldEventDocLogStep';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

// Folding a WHOLE log is the per-event step config plus somewhere to start, so the shape is derived
// rather than restated - a new field on the step config cannot be forgotten here.
export type FoldEventDocLogConfig<TState extends EventDocDocument> = FoldEventDocLogStepConfig<TState> & {
  // INIT_STATE resets to the version's initial anyway, so the seed is overwritten;
  // pass the latest version's initial for the empty-log case.
  seed: TState;
};

// Migrate the accumulator UP to each event's version BEFORE folding it, so every vN
// reducer sees its own shape, then climb to latestVersion at the end (a v1-only log still
// resolves to latest). A missing migration step throws; a future-version event is clamped
// out of the target. The per-event body lives in foldEventDocLogStep, shared with the
// workspace's incremental historyViews fold so the two can't drift.
//
// THE FOLD IS THE GATE. Appends are unvalidated and unordered-by-content (they claim an
// index atomically and write), so this loop is where an event earns its place in the
// document: `validators` rejects it on the collection's own rules, and the acceptance
// bookkeeping rejects a duplicate clientMessageId or a stale schema version. A rejected
// event is skipped silently and never touches the state. Ordering is still the log's
// index order, so the verdict for any given event is fixed forever once its predecessors
// are known.
export const foldEventDocLog = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  { seed, reducer, migrations, latestVersion, validators }: FoldEventDocLogConfig<TState>,
): TState => {
  let state: EventDocDocument = { ...seed };
  const acceptance = createEventDocAcceptance();

  for (const event of events) {
    state = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion, validators, acceptance });
  }

  return migrateEventDocDocumentTo(state, latestVersion, migrations) as TState;
};
