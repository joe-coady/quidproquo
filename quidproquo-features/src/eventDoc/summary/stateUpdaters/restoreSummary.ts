import { EventDocEventPayload, EventDocSummary } from '../../models';

// RESTORE clears the projected `deletedAt`, putting the document back in default listings.
export const restoreSummary = (model: EventDocSummary, _payload: EventDocEventPayload): EventDocSummary => {
  const { deletedAt, ...restored } = model;

  return restored;
};
