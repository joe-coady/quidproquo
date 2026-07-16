import { EventDocWorkspaceSlotState } from '../../types/EventDocWorkspaceSlotState';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Shared by the slot-status updaters; no-ops on an unknown slotKey (slot keys are
// fixed at workspace definition time).
export const updateSlotState = (
  state: EventDocWorkspaceState,
  slotKey: string,
  update: Partial<EventDocWorkspaceSlotState>,
): EventDocWorkspaceState =>
  slotKey in state.slots ? { ...state, slots: { ...state.slots, [slotKey]: { ...state.slots[slotKey], ...update } } } : state;
