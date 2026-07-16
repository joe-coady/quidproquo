import { EventDocEvent } from '../../models';
import { createInitialEventDocWorkspaceSlotState, EventDocWorkspaceSlotState } from './EventDocWorkspaceSlotState';

// A workspace is n named event streams. `history` is the confirmed log per slot,
// `pending` the unsaved buffer; the live view of a slot is always
// [...history[key], ...pending[key]], folded by the slot's fold reducer in selectors.
// The log is the source of truth: no folded document is ever stored here.
export type EventDocWorkspaceState = {
  history: Record<string, EventDocEvent[]>;
  pending: Record<string, EventDocEvent[]>;
  slots: Record<string, EventDocWorkspaceSlotState>;
};

const mapFromSlotKeys = <T>(slotKeys: string[], createValue: () => T): Record<string, T> =>
  Object.fromEntries(slotKeys.map((slotKey) => [slotKey, createValue()]));

export const createInitialEventDocWorkspaceState = (slotKeys: string[]): EventDocWorkspaceState => ({
  history: mapFromSlotKeys(slotKeys, () => []),
  pending: mapFromSlotKeys(slotKeys, () => []),
  slots: mapFromSlotKeys(slotKeys, createInitialEventDocWorkspaceSlotState),
});
