import { EventDocEventPayload, EventDocSummaryView } from '../../models';

// DELETE projects onto the record as `deletedAt`, which askEventDocList filters on by
// default. Derived from the event, so rebuilding the projection preserves the deletion.
export const deleteSummary = (model: EventDocSummaryView, { metadata }: EventDocEventPayload): EventDocSummaryView => ({
  ...model,
  deletedAt: metadata.createdAt,
});
