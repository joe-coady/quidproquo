import {
  EventDocDocument,
  EventDocEventPayload,
  EventDocSetNameData,
} from '../../models';

export const setName = <TState extends EventDocDocument>(
  state: TState,
  { data }: EventDocEventPayload<EventDocSetNameData>
): TState => ({
  ...state,
  name: data.name,
});
