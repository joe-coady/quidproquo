import { EventDocWorkspaceSetHistoryEventsPayload } from '../../effects/EventDocWorkspaceSetHistoryEventsEffect';
import { EventDocWorkspaceSlotsConfig } from '../../types/EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { foldSlotHistory } from './foldSlotHistory';

// Replace a slot's saved log wholesale (the init full-load path) and full-fold it into
// the stored accumulator. No-ops on an unknown slotKey (as do all stream updaters):
// slot keys are fixed at workspace definition time, so an unrecognised key is a
// misdirected effect, not a request to grow the state shape.
export const createSetHistoryEventsUpdater =
  (slots: EventDocWorkspaceSlotsConfig) =>
  (state: EventDocWorkspaceState, { slotKey, events }: EventDocWorkspaceSetHistoryEventsPayload): EventDocWorkspaceState => {
    const slot = slots[slotKey];

    if (!(slotKey in state.slots) || !slot) {
      return state;
    }

    return {
      ...state,
      history: { ...state.history, [slotKey]: events },
      historyViews: { ...state.historyViews, [slotKey]: foldSlotHistory(slot, events) },
    };
  };
