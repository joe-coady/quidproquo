import { QpqReducer } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from '../validation/types/EventDocEventValidators';
import { createEventDocAcceptance, EventDocAcceptance, recordEventDocAcceptance, rejectEventDocEvent } from './acceptEventDocEvent';
import { EventDocMigrations } from './EventDocMigrations';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

export type FoldEventDocLogStepConfig<TState extends EventDocDocument> = {
  reducer: QpqReducer<TState, EventDocEvent>;
  migrations: EventDocMigrations;
  latestVersion: number;

  // The collection's validator registry. Supplied => the fold is the gate: an event that
  // fails a rule is SKIPPED, silently, and the document reads as if it was never written.
  // Omitted => every event folds, which is what a caller re-deriving a already-vetted
  // slice (a published version's frozen events) wants.
  validators?: EventDocEventValidators<TState>;

  // Cross-event bookkeeping (dedup, version floor) threaded by the caller's loop. A
  // single-step caller can leave it out and get the validator rules only.
  acceptance?: EventDocAcceptance;
};

// Fold ONE event onto the accumulator: migrate the state UP to the event's version
// (clamped to latestVersion, so a future-version event folds at latest), decide whether
// the event is accepted, apply the version-routed reducer, stamp updatedAt.
//
// A REJECTED event returns the accumulator untouched — not even updatedAt moves, because
// an ignored event is not part of the document and must not look like activity on it.
// Rejection is silent by design: appends no longer validate, so an invalid event in a log
// is the rare residue of a client that skipped its own pre-flight validation, and the
// right behaviour is for the document to read as though it never happened.
//
// This is the exact loop body of foldEventDocLog, extracted so the workspace's
// incremental historyViews fold shares its semantics instead of drifting.
export const foldEventDocLogStep = <TState extends EventDocDocument>(
  state: EventDocDocument,
  event: EventDocEvent,
  { reducer, migrations, latestVersion, validators, acceptance }: FoldEventDocLogStepConfig<TState>,
): EventDocDocument => {
  const target = Math.min(event.payload.metadata.version, latestVersion);

  let next: EventDocDocument = migrateEventDocDocumentTo(state, target, migrations);

  const book = acceptance ?? createEventDocAcceptance();
  if (rejectEventDocEvent(event, next as TState, book, validators)) {
    return state;
  }
  recordEventDocAcceptance(book, event);

  [next] = reducer(next as TState, event);

  return { ...next, updatedAt: event.payload.metadata.createdAt };
};
