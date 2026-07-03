import type { EventDocEventMetadata } from './EventDocEventMetadata';

// The payload the client constructs and sends — the full payload minus the
// fields only the server can know (index/createdAt) or assert (createdBy).
export type ClientEventDocEventPayload<T = unknown> = {
  data: T;
  metadata: Omit<EventDocEventMetadata, 'index' | 'createdAt' | 'createdBy'>;
};
