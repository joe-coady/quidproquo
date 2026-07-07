import { EventDocDocument, EventDocEventPayload, EventDocSetCodeData } from '../../models';

export const setCode = <TState extends EventDocDocument>(state: TState, { data }: EventDocEventPayload<EventDocSetCodeData>): TState => ({
  ...state,
  code: data.code,
});
