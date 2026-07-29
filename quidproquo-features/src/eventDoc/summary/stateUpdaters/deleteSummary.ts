import { EventDocEventPayload, EventDocSummary } from '../../models';

// DELETE projects onto the record as `deletedAt`, which askEventDocList filters on by
// default. Derived from the event, so rebuilding the projection preserves the deletion.
export const deleteSummary = (model: EventDocSummary, { metadata }: EventDocEventPayload): EventDocSummary => ({
  ...model,
  deletedAt: metadata.createdAt,
});
