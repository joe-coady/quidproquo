import { EventDocDocument, EventDocEvent } from '../models';
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
// resolves to latest). The per-event body lives in foldEventDocLogStep, shared with the
// workspace's incremental historyViews fold so the two can't drift.
//
// THE FOLD IS THE GATE. Appends are unvalidated and unordered-by-content (they claim an
// index atomically and write), so this loop is where an event earns its place in the
// document: `validators` rejects it on the collection's own rules, and the state-based
// rules reject a duplicate clientMessageId or a stale schema version. A rejected
// event is skipped silently and never touches the state. Ordering is still the log's
// index order, so the verdict for any given event is fixed forever once its predecessors
// are known.
export const foldEventDocLog = <TState extends EventDocDocument>(events: EventDocEvent[], config: FoldEventDocLogConfig<TState>): TState =>
  foldEventDocLogAccepted(events, config).state;

// The same fold, additionally reporting WHICH events earned their place. A doc type's
// secondary views (summaries, projections) fold this accepted set rather than the raw log:
// acceptance is decided once, by the document view acting as the gate, so every view of a
// log sees the identical event set. Folding the raw log in each view instead would let a
// secondary view apply an event the document rejected — two views of one document that
// disagree about its contents, which is unfixable after the fact.
export const foldEventDocLogAccepted = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  config: FoldEventDocLogConfig<TState>,
): { state: TState; accepted: EventDocEvent[] } => {
  const { state, accepted } = foldEventDocLogAsWritten(events, config);

  return { state: migrateEventDocDocumentTo(state, config.latestVersion, config.migrations) as TState, accepted };
};

// The same fold WITHOUT the final climb to latestVersion: the state comes out at the
// schema version the log actually reached — what the document looked like when its last
// accepted event was written, not reshaped by whatever code version happens to be
// deployed when the fold runs.
//
// This is the fold snapshots are made of. Pinning the era makes a snapshot an immutable
// fact of the log (refolding the same prefix yields the same snapshot forever, deploys
// notwithstanding), and it makes the state a correct SEED for resuming the fold: its
// schemaVersion IS the accepted version floor, where a latest-climbed state would carry an
// inflated floor that rejects old-version events a from-scratch fold accepts. Live reads
// wanting latest shape migrate up afterwards (foldEventDocLogAccepted, the read-side
// foldEventDocLiveView) — the climb belongs to the reader, not to the fact.
export const foldEventDocLogAsWritten = <TState extends EventDocDocument>(
  events: EventDocEvent[],
  { seed, reducer, migrations, latestVersion, validators }: FoldEventDocLogConfig<TState>,
): { state: TState; accepted: EventDocEvent[] } => {
  let state: EventDocDocument = { ...seed };
  const accepted: EventDocEvent[] = [];

  for (const event of events) {
    const [next, wasAccepted] = foldEventDocLogStep(state, event, { reducer, migrations, latestVersion, validators });

    state = next;
    if (wasAccepted) {
      accepted.push(event);
    }
  }

  return { state: state as TState, accepted };
};
