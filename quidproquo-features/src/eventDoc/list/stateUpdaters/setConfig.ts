import type { EventDocListSetConfigPayload } from '../effects/EventDocListSetConfigEffect';
import type { EventDocListState } from '../types/EventDocListState';

export const setConfig = (state: EventDocListState, config: EventDocListSetConfigPayload): EventDocListState => ({
  ...state,
  ...config,
});
