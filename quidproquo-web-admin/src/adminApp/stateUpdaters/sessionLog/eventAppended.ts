import { EventDocEvent } from 'quidproquo-features';

import { coalesceEventTypes } from '../../constants/coalesceEventTypes';
import { AdminSessionEventType } from '../../effects/session/AdminSessionEventType';
import { SessionLogState } from '../../SessionLogState';

const nextLocalIndex = (state: SessionLogState): number => {
  const tail = state.pendingEvents[state.pendingEvents.length - 1] ?? state.events[state.events.length - 1];
  return tail ? tail.payload.metadata.index + 1 : 0;
};

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
        metadata: { ...event.payload.metadata, index: last.payload.metadata.index },
      },
    };

    return {
      ...state,
      pendingEvents: [...state.pendingEvents.slice(0, -1), coalesced],
    };
  }

  const appended: EventDocEvent = {
    ...event,
    payload: {
      ...event.payload,
      metadata: { ...event.payload.metadata, index: nextLocalIndex(state) },
    },
  };

  return {
    ...state,
    pendingEvents: [...state.pendingEvents, appended],
  };
};
