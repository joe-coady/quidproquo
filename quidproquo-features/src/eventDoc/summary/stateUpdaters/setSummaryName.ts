import {
  EventDocEventPayload,
  EventDocSetNameData,
  EventDocSummary,
} from '../../models';

export const setSummaryName = (
  model: EventDocSummary,
  { data }: EventDocEventPayload<EventDocSetNameData>
): EventDocSummary => ({
  ...model,
  name: data.name,
});
