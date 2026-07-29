import { EventDocEvent } from 'quidproquo-features';

import { coalesceEventTypes } from '../../constants/coalesceEventTypes';
import { AdminSessionEventType } from '../../effects/session/AdminSessionEventType';
import { SessionLogState } from '../../SessionLogState';

// Optimistic append with coalescing: while the previous event of the same
// coalescable type is still pending, the new one replaces it (latest value
// wins). The head is never coalesced while the flush has it in flight — the
// POSTed clientMessageId must stay matchable for the save ack.
export const eventAppended = (state: SessionLogState, event: EventDocEvent): SessionLogState => {
  const last = state.pendingEvents[state.pendingEvents.length - 1];

  const lastIsInFlightHead = state.pendingEvents.length === 1 && state.flush.inFlight;
  const shouldCoalesce =
    !!last && !lastIsInFlightHead && last.type === event.type && coalesceEventTypes.includes(event.type as AdminSessionEventType);

  if (shouldCoalesce) {
    const coalesced: EventDocEvent = {
      ...event,
      payload: {
        ...event.payload,
        // Keeps the replaced event's id, so the coalesced event holds its place in the log
        // rather than jumping to the end.
        metadata: { ...event.payload.metadata, eventId: last.payload.metadata.eventId },
      },
    };

    return {
      ...state,
      pendingEvents: [...state.pendingEvents.slice(0, -1), coalesced],
    };
  }

  // The event already carries the id minted when it was created, and sortable ids order
  // themselves, so there is nothing to assign here.
  return {
    ...state,
    pendingEvents: [...state.pendingEvents, event],
  };
};
