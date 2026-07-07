import type { EventDocEvent } from '../../models';
import type { EventDocStoredEvent } from '../../types/EventDocStoredEvent';

// Event is stored verbatim in `data`, so this is just the blob.
export const eventDocStoredEventToEvent = <T = unknown>(record: EventDocStoredEvent): EventDocEvent<T> => record.data as EventDocEvent<T>;
