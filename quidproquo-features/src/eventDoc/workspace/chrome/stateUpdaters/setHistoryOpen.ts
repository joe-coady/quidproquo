import { EventDocEventPayload } from '../../../models';
import { EventDocWorkspaceChromeSetHistoryOpenPayload } from '../effects/EventDocWorkspaceChromeSetHistoryOpenEffect';
import { EventDocWorkspaceChromeState } from '../types/EventDocWorkspaceChromeState';

export const setHistoryOpen = (
  state: EventDocWorkspaceChromeState,
  payload: EventDocEventPayload<EventDocWorkspaceChromeSetHistoryOpenPayload>,
): EventDocWorkspaceChromeState => ({
  ...state,
  historyOpen: payload.data.open,
});
