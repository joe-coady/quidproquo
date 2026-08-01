import { EventDocEventPayload, EventDocSetCodeData, EventDocSummaryView } from '../../models';

export const setSummaryCode = (model: EventDocSummaryView, { data }: EventDocEventPayload<EventDocSetCodeData>): EventDocSummaryView => ({
  ...model,
  code: data.code,
});
