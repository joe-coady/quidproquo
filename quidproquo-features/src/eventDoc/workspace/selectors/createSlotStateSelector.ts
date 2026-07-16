import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';
import { createInitialEventDocWorkspaceSlotState, EventDocWorkspaceSlotState } from '../types/EventDocWorkspaceSlotState';

// Shared fallback for reads before init / unknown keys; read-only so sharing is safe.
const fallbackSlotState = createInitialEventDocWorkspaceSlotState();

export const createSlotStateSelector =
  (slotKey: string): EventDocWorkspaceSelector<EventDocWorkspaceSlotState> =>
  (state) =>
    state.slots[slotKey] ?? fallbackSlotState;
