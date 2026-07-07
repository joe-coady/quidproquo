import { QpqIsoDateTime } from 'quidproquo-core';

import type { EventDocEventActor } from './EventDocEventActor';

// Provenance carried by every event-doc event. Split by ownership: the
// client supplies version + clientMessageId; the server stamps createdBy,
// createdAt, and index (the latter mirrors the storage sort key).
export type EventDocEventMetadata = {
  version: number;
  clientMessageId: string;
  createdBy: EventDocEventActor;
  createdAt: QpqIsoDateTime;
  index: number;
};
