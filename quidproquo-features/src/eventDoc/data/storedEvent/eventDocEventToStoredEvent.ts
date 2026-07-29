import type { EventDocEvent } from '../../models';
import type { EventDocStoredEvent } from '../../types/EventDocStoredEvent';

// `modelId` and `type` are routing supplied by the handler, not carried on the event.
export const eventDocEventToStoredEvent = (modelId: string, type: string, event: EventDocEvent): EventDocStoredEvent => ({
  pk: modelId,
  sk: event.payload.metadata.eventId,
  type,
  data: event,
});
