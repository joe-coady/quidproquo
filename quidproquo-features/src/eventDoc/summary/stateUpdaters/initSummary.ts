import { EventDocEventPayload, EventDocInitData, EventDocSummary } from '../../models';

// INIT builds the record's identity from the event, preserving `type` from the seed.
// updatedAt/updatedBy are stamped by the applier (every event), so only the write-once
// createdAt/createdBy + identity + the v1 version entry live here. `eventId` seeds v1's
// head (this INIT_STATE event); the applier advances it as further events append.
export const initSummary = (model: EventDocSummary, { data, metadata }: EventDocEventPayload<EventDocInitData>): EventDocSummary => ({
  ...model,
  id: data.id,
  code: data.code,
  name: data.name,
  createdAt: metadata.createdAt,
  createdBy: metadata.createdBy.userId,
  versions: [{ version: 1, eventId: metadata.eventId }],
});
