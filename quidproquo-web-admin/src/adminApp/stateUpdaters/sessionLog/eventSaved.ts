import { EventDocEvent } from 'quidproquo-features';

import { SessionLogEventSavedPayload } from '../../effects/sessionLog/SessionLogEventSavedEffect';
import { SessionLogState } from '../../SessionLogState';

// Server ack: the pending event moves to the acked log with its server-stamped
// metadata, and the remaining pending events renumber onto consecutive indexes
// after it (the server may have assigned a later index than our optimistic one).
export const eventSaved = (state: SessionLogState, payload: SessionLogEventSavedPayload): SessionLogState => {
  const savedAt = state.pendingEvents.findIndex((event) => event.payload.metadata.clientMessageId === payload.clientMessageId);

  const remaining = savedAt === -1 ? state.pendingEvents : [...state.pendingEvents.slice(0, savedAt), ...state.pendingEvents.slice(savedAt + 1)];

  // No renumbering: each pending event minted its own sortable id, which already sorts after
  // the saved log. Removing one from the middle leaves the rest correctly ordered.
  return {
    ...state,
    events: [...state.events, payload.storedEvent],
    pendingEvents: remaining,
    flush: { inFlight: false, lastError: null, retryCount: 0 },
  };
};
