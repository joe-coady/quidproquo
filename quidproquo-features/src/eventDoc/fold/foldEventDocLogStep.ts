import { QpqReducer } from 'quidproquo-core';

import { EVENT_DOC_RECENT_CLIENT_MESSAGE_ID_WINDOW } from '../constants/eventDocRecentClientMessageIdWindow';
import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from '../validation/types/EventDocEventValidators';
import { rejectEventDocEvent } from './acceptEventDocEvent';
import { EventDocMigrations } from './EventDocMigrations';
import { migrateEventDocDocumentTo } from './migrateEventDocDocumentTo';

export type FoldEventDocLogStepConfig<TState extends EventDocDocument> = {
  reducer: QpqReducer<TState, EventDocEvent>;
  migrations: EventDocMigrations;
  latestVersion: number;

  // The collection's validator registry. Supplied => the fold is the gate: an event that
  // fails a rule is SKIPPED, silently, and the document reads as if it was never written.
  // Omitted => only the state-based rules apply (retry dedup, version floor), which is
  // what a caller re-deriving an already-vetted slice (a published version's frozen
  // events) wants — a vetted slice has unique ids and non-decreasing versions, so those
  // rules never fire on it.
  validators?: EventDocEventValidators<TState>;
};

// Fold ONE event onto the accumulator: migrate the state UP to the event's version
// (clamped to latestVersion, so a future-version event folds at latest), decide whether
// the event is accepted, apply the version-routed reducer, stamp updatedAt and the
// rolling dedup window.
//
// Returns [state, accepted]. A REJECTED event returns the accumulator untouched — not even
// updatedAt moves, because an ignored event is not part of the document and must not look
// like activity on it. Nor does its clientMessageId enter the dedup window: a rejected
// event is not part of the document, so it must not shadow a later valid event's id.
// The flag is what lets a caller RECORD the accepted set rather than infer it: a doc
// type's secondary views replay exactly the events the document view let in, so no two
// views of one log can disagree about what the log contains.
// Rejection is silent by design: appends no longer validate, so an invalid event in a log
// is the rare residue of a client that skipped its own pre-flight validation, and the
// right behaviour is for the document to read as though it never happened.
//
// The cross-event rules (dedup, version floor) read the STATE alone — see
// rejectEventDocEvent — so every caller of this step gets them, incremental folds
// included: state carried across steps IS the bookkeeping.
//
// This is the exact loop body of foldEventDocLog, extracted so the workspace's
// incremental historyViews fold shares its semantics instead of drifting.
export const foldEventDocLogStep = <TState extends EventDocDocument>(
  state: EventDocDocument,
  event: EventDocEvent,
  { reducer, migrations, latestVersion, validators }: FoldEventDocLogStepConfig<TState>,
): [EventDocDocument, boolean] => {
  const target = Math.min(event.payload.metadata.version, latestVersion);

  let next: EventDocDocument = migrateEventDocDocumentTo(state, target, migrations);

  if (rejectEventDocEvent(event, next as TState, validators)) {
    return [state, false];
  }

  [next] = reducer(next as TState, event);

  const { clientMessageId, createdAt } = event.payload.metadata;
  const accepted: EventDocDocument = { ...next, updatedAt: createdAt };

  if (clientMessageId) {
    accepted.recentClientMessageIds = [...(next.recentClientMessageIds ?? []), clientMessageId].slice(-EVENT_DOC_RECENT_CLIENT_MESSAGE_ID_WINDOW);
  }

  return [accepted, true];
};
