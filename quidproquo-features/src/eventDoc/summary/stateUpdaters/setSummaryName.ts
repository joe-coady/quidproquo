import { EventDocEventPayload, EventDocSetNameData, EventDocSummaryView } from '../../models';

export const setSummaryName = (model: EventDocSummaryView, { data }: EventDocEventPayload<EventDocSetNameData>): EventDocSummaryView => ({
  ...model,
  name: data.name,
});
