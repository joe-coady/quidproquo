import { EventDocWorkspaceAppendFullHistoryPayload } from '../../effects/EventDocWorkspaceAppendFullHistoryEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Append one OLDER page to a slot's newest-first history and advance the cursor.
// No-ops when nothing is loaded yet (an older page cannot precede a first page — a
// stale dispatch after the panel was reset) or on an unknown slotKey.
export const appendFullHistory = (
  state: EventDocWorkspaceState,
  { slotKey, events, nextPageKey }: EventDocWorkspaceAppendFullHistoryPayload,
): EventDocWorkspaceState => {
  const current = state.fullHistory[slotKey];

  if (!(slotKey in state.slots) || !current) {
    return state;
  }

  return {
    ...state,
    fullHistory: { ...state.fullHistory, [slotKey]: { events: [...current.events, ...events], nextPageKey } },
  };
};
