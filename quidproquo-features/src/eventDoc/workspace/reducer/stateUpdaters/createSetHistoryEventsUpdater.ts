import { EventDocWorkspaceSetHistoryEventsPayload } from '../../effects/EventDocWorkspaceSetHistoryEventsEffect';
import { EventDocWorkspaceSlotFoldsConfig } from '../../types/EventDocWorkspaceSlotFoldsConfig';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { foldSlotHistory } from './foldSlotHistory';

// Replace a slot's saved log wholesale (the init load path) and fold it into the
// stored accumulator, seeded from the base it came with (base and log are replaced
// together so they can never disagree). No-ops on an unknown slotKey (as do all
// stream updaters): slot keys are fixed at workspace definition time, so an
// unrecognised key is a misdirected effect, not a request to grow the state shape.
export const createSetHistoryEventsUpdater =
  (slots: EventDocWorkspaceSlotFoldsConfig) =>
  (state: EventDocWorkspaceState, { slotKey, events, base }: EventDocWorkspaceSetHistoryEventsPayload): EventDocWorkspaceState => {
    const slot = slots[slotKey];

    if (!(slotKey in state.slots) || !slot) {
      return state;
    }

    return {
      ...state,
      history: { ...state.history, [slotKey]: events },
      bases: { ...state.bases, [slotKey]: base ?? null },
      // A replaced log may be a different document's — the on-demand complete log
      // is stale either way and reloads on next request.
      fullHistory: { ...state.fullHistory, [slotKey]: null },
      historyViews: { ...state.historyViews, [slotKey]: foldSlotHistory(slot, events, base ?? null) },
    };
  };
