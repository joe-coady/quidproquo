import { Nullable } from 'quidproquo-core';

import { EventDocDocument, EventDocEvent } from '../models';
import { EventDocEventValidators } from '../validation/types/EventDocEventValidators';
import { validateEventDocEvent } from '../validation/validateEventDocEvent';

// The cross-event bookkeeping a log fold carries alongside the folded state. Both rules
// below used to be tail reads inside the append handler; under concurrent appends "the
// tail" is whichever writer happened to land last, so neither could be decided reliably
// at write time. They are decided here instead, against the accepted prefix.
export type EventDocAcceptance = {
  // clientMessageIds of events already ACCEPTED into the fold. A retry re-sends its id,
  // so the duplicate is ignored rather than applied twice. Strictly better than the old
  // append-time check, which only ever compared against the single latest event.
  seenClientMessageIds: Set<string>;

  // Highest schema version accepted so far. Events are expected to be non-decreasing in
  // version; one authored against an older schema than the log has already moved past is
  // ignored rather than folded through a reducer that no longer matches its shape.
  maxVersion: number;
};

export const createEventDocAcceptance = (): EventDocAcceptance => ({
  seenClientMessageIds: new Set<string>(),
  maxVersion: 0,
});

// Decide whether one event may be folded onto `state` (the document as of the accepted
// events before it). Returns the rejection reason, or null to accept.
//
// The verdict is a pure function of the event, the accepted prefix, and the validator
// registry — never of anything that comes after it. That invariant is what makes the
// whole scheme sound: a fold at any later time reaches the same verdict for the same
// event, so folds are reproducible, snapshottable, and safe to run concurrently with
// further appends. A validator that looks forward would break it.
export const rejectEventDocEvent = <S extends EventDocDocument>(
  event: EventDocEvent,
  state: S,
  acceptance: EventDocAcceptance,
  validators?: EventDocEventValidators<S>,
): Nullable<string> => {
  const { clientMessageId, version } = event.payload.metadata;

  if (clientMessageId && acceptance.seenClientMessageIds.has(clientMessageId)) {
    return `Duplicate clientMessageId ${clientMessageId}`;
  }

  if (version < acceptance.maxVersion) {
    return `Event version ${version} is older than the log's version ${acceptance.maxVersion}`;
  }

  return validators ? validateEventDocEvent(validators, event, state) : null;
};

// Record an accepted event in the bookkeeping. Rejected events are NOT recorded: they are
// not part of the document, so they must not shadow a later valid event's message id or
// drag the version floor up.
export const recordEventDocAcceptance = (acceptance: EventDocAcceptance, event: EventDocEvent): EventDocAcceptance => {
  const { clientMessageId, version } = event.payload.metadata;

  if (clientMessageId) {
    acceptance.seenClientMessageIds.add(clientMessageId);
  }
  acceptance.maxVersion = Math.max(acceptance.maxVersion, version);

  return acceptance;
};
