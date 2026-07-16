import { EventDocWorkspaceSetHistoryEventsPayload } from '../../effects/EventDocWorkspaceSetHistoryEventsEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// No-ops on an unknown slotKey (as do all stream updaters): slot keys are fixed at
// workspace definition time, so an unrecognised key is a misdirected effect, not a
// request to grow the state shape.
export const setHistoryEvents = (
  state: EventDocWorkspaceState,
  { slotKey, events }: EventDocWorkspaceSetHistoryEventsPayload,
): EventDocWorkspaceState => (slotKey in state.slots ? { ...state, history: { ...state.history, [slotKey]: events } } : state);
