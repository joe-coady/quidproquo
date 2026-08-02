import { EventDocWorkspaceSetFullHistoryPayload } from '../../effects/EventDocWorkspaceSetFullHistoryEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Store (or clear) a slot's on-demand complete log. Pure side-channel: no fold, no
// touch of the working history. No-ops on an unknown slotKey (as do all stream
// updaters).
export const setFullHistory = (state: EventDocWorkspaceState, { slotKey, events }: EventDocWorkspaceSetFullHistoryPayload): EventDocWorkspaceState => {
  if (!(slotKey in state.slots)) {
    return state;
  }

  return {
    ...state,
    fullHistory: { ...state.fullHistory, [slotKey]: events },
  };
};
