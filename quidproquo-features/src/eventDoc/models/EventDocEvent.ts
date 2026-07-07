import type { EventDocEventPayload } from './EventDocEventPayload';

// A event-doc event IS a QPQ effect: a type discriminant plus a payload.
// The reducer folds it directly. `modelId` and `index` are NOT here — they are
// pure routing/storage (the request path + the storage keys); `index` is
// surfaced to the consumer via `payload.metadata.index`.
export type EventDocEvent<T = unknown> = {
  type: string;
  payload: EventDocEventPayload<T>;
};
