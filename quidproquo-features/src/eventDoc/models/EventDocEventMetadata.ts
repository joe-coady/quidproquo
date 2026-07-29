import { QpqIsoDateTime } from 'quidproquo-core';

import type { EventDocEventActor } from './EventDocEventActor';

// Provenance carried by every event-doc event. Split by ownership: the
// client supplies version + clientMessageId; the server stamps createdBy,
// createdAt, and eventId (the latter mirrors the storage sort key).
//
// `eventId` is a SORTABLE ID (UUIDv7 via askNewSortableGuid), not a counter. Its canonical
// string form sorts lexicographically in creation order, so the log stays ordered without
// any writer ever having to allocate a position — which is what lets concurrent appends
// proceed with no coordination at all. Compare it with < / <=, never arithmetic.
export type EventDocEventMetadata = {
  version: number;
  clientMessageId: string;
  createdBy: EventDocEventActor;
  createdAt: QpqIsoDateTime;
  eventId: string;
};
