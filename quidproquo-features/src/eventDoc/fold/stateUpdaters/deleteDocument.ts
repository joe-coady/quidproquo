import { EventDocDocument, EventDocEventPayload } from '../../models';

// DELETE marks the document soft-deleted, stamping who and when from the event's own
// metadata. Everything else is left intact: versions, content and history all survive, so a
// RESTORE puts the document back exactly as it was.
export const deleteDocument = <TState extends EventDocDocument>(state: TState, { metadata }: EventDocEventPayload): TState => ({
  ...state,
  deletedAt: metadata.createdAt,
  deletedBy: metadata.createdBy.userId,
});
