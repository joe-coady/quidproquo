import { Nullable } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from '../validation/types/EventDocEventValidators';
import { validateEventDocEvent } from '../validation/validateEventDocEvent';

// Decide whether one event may be folded onto `state` (the document as of the accepted
// events before it). Returns the rejection reason, or null to accept.
//
// Both cross-event rules read the STATE and nothing else — no loop-local bookkeeping:
//
// - Retry dedup: an event whose clientMessageId is among the state's recently accepted ids
//   (EventDocDocument.recentClientMessageIds, a rolling window foldEventDocLogStep stamps
//   on accept) is a client retry and is ignored rather than applied twice.
//
// - Version floor: an event authored against an older schema version than the state has
//   already folded to is ignored rather than folded through a reducer that no longer
//   matches its shape. `schemaVersion` climbs per accepted event, so mid-fold it IS the
//   accepted floor. The check is skipped for a PRISTINE state (no INIT_STATE folded yet,
//   identifiable by its empty id, since real logs always open with INIT_STATE): a pristine
//   seed can legitimately carry the code's latest version as its default (the workspace's
//   latest-shaped initial view state) without a single event behind it, and must not
//   reject a real old-version log folding onto it.
//
// The verdict is a pure function of the event, the state its accepted predecessors built,
// and the validator registry — never of anything that comes after it. That invariant is
// what makes the whole scheme sound: a fold at any later time — including one resuming
// from a stored snapshot of the state — reaches the same verdict for the same event, so
// folds are reproducible and safe to run concurrently with further appends. A rule that
// needed memory OUTSIDE the state would break it, which is exactly why the dedup window
// lives on the document.
export const rejectEventDocEvent = <S extends EventDocDocument>(
  event: EventDocEvent,
  state: S,
  validators?: EventDocEventValidators<S>,
): Nullable<string> => {
  const { clientMessageId, version } = event.payload.metadata;

  if (clientMessageId && state.recentClientMessageIds?.includes(clientMessageId)) {
    return `Duplicate clientMessageId ${clientMessageId}`;
  }

  if (state.id !== '' && version < state.schemaVersion) {
    return `Event version ${version} is older than the document's version ${state.schemaVersion}`;
  }

  return validators ? validateEventDocEvent(validators, event, state) : null;
};
