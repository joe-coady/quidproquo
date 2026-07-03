import type { EventDocEvent } from '../../models';
import type { EventDocStoredEvent } from '../../types/EventDocStoredEvent';

// `modelId` is routing supplied by the handler, not carried on the event.
export const eventDocEventToStoredEvent = (
  modelId: string,
  event: EventDocEvent
): EventDocStoredEvent => ({
  pk: modelId,
  sk: event.payload.metadata.index,
  data: event,
});
