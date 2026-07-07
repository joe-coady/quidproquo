import type { EventDocEvent } from '../models';

// Only place that knows pk=modelId / sk=index, keeping the domain event free of
// storage concerns.
export type EventDocStoredEvent = {
  pk: string;
  sk: number;
  data: EventDocEvent;
};
