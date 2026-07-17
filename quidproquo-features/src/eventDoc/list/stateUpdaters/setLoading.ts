import type { EventDocListSetLoadingPayload } from '../effects/EventDocListSetLoadingEffect';
import type { EventDocListState } from '../types/EventDocListState';

export const setLoading = (state: EventDocListState, { isLoading }: EventDocListSetLoadingPayload): EventDocListState => ({
  ...state,
  isLoading,
});
