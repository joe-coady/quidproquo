import { EventDocWorkspaceSetFullHistoryPayload } from '../../effects/EventDocWorkspaceSetFullHistoryEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Replace (or clear) a slot's on-demand newest-first history. Pure side-channel: no
// fold, no touch of the working history. No-ops on an unknown slotKey (as do all
// stream updaters).
export const setFullHistory = (state: EventDocWorkspaceState, { slotKey, history }: EventDocWorkspaceSetFullHistoryPayload): EventDocWorkspaceState => {
  if (!(slotKey in state.slots)) {
    return state;
  }

  return {
    ...state,
    fullHistory: { ...state.fullHistory, [slotKey]: history },
  };
};
