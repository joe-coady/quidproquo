import type { ClientEventDocEventPayload } from './ClientEventDocEventPayload';

// What the client POSTs to append an event. `modelId` comes from the URL path,
// so it is not part of the body.
export type EventDocEventInput<T = unknown> = {
  type: string;
  payload: ClientEventDocEventPayload<T>;
};
