import { EventDocEvent } from '../../../models';
import { EventDocWorkspaceSlotsConfig } from '../../types/EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { foldHistoryEventsIntoAccumulator } from './foldHistoryEventsIntoAccumulator';

// Shared by the append-history updaters (singular save-landing, plural refresh tail):
// append the events to the slot's saved log AND fold them incrementally into the
// stored accumulator, so the two can never disagree. No-ops on an unknown slotKey
// (slot keys are fixed at workspace definition time).
export const appendSlotHistoryEvents = (
  slots: EventDocWorkspaceSlotsConfig,
  state: EventDocWorkspaceState,
  slotKey: string,
  events: EventDocEvent[],
): EventDocWorkspaceState => {
  const slot = slots[slotKey];

  if (!(slotKey in state.slots) || !slot) {
    return state;
  }

  return {
    ...state,
    history: { ...state.history, [slotKey]: [...(state.history[slotKey] ?? []), ...events] },
    historyViews: { ...state.historyViews, [slotKey]: foldHistoryEventsIntoAccumulator(slot, state.historyViews[slotKey], events) },
  };
};
