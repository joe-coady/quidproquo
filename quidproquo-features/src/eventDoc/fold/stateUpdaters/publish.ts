import { EventDocDocument, EventDocStatus } from '../../models';

export const publish = <TState extends EventDocDocument>(
  state: TState
): TState => ({
  ...state,
  status: EventDocStatus.Published,
});
