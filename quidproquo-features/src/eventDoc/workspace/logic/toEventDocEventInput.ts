import { EventDocEvent, EventDocEventInput } from '../../models';

// Strip a buffered event to the client-owned fields for the append POST; the backend
// stamps createdBy/createdAt/index and returns the full stored event.
export const toEventDocEventInput = (event: EventDocEvent): EventDocEventInput => ({
  type: event.type,
  payload: {
    data: event.payload.data,
    metadata: {
      version: event.payload.metadata.version,
      clientMessageId: event.payload.metadata.clientMessageId,
    },
  },
});
