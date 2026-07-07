import type { EventDocEventMetadata } from './EventDocEventMetadata';

// The full payload the consumer reduces: typed domain data plus complete
// provenance. This is what a load/fold or a save-ack carries.
export type EventDocEventPayload<T = unknown> = {
  data: T;
  metadata: EventDocEventMetadata;
};
