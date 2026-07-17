import type { EventDocListSetErrorPayload } from '../effects/EventDocListSetErrorEffect';
import type { EventDocListState } from '../types/EventDocListState';

export const setError = (state: EventDocListState, { error }: EventDocListSetErrorPayload): EventDocListState => ({
  ...state,
  error,
});
