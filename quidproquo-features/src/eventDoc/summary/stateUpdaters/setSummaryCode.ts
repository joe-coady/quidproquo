import { EventDocEventPayload, EventDocSetCodeData, EventDocSummary } from '../../models';

export const setSummaryCode = (model: EventDocSummary, { data }: EventDocEventPayload<EventDocSetCodeData>): EventDocSummary => ({
  ...model,
  code: data.code,
});
