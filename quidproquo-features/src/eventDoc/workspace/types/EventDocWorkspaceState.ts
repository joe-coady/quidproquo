import { EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotFoldsConfig } from './EventDocWorkspaceSlotFoldsConfig';
import { createInitialEventDocWorkspaceSlotState, EventDocWorkspaceSlotState } from './EventDocWorkspaceSlotState';

// A workspace is n named event streams, each holding three groups of events:
// - `history` — server truth: the confirmed (saved) log per slot.
// - `pending` — client intent: the unsaved buffer; EVERY commit lands here, Save moves
//   it via the server into history, and a local slot's pending simply never saves.
// - `transient` — never-saved observations (progress messages, ephemeral status),
//   grouped per slot by transientKey (usually a websocket connection id — the unit you
//   drop); dropping a key clears it across all slots and the folded views revert.
// `historyViews` is the fold ACCUMULATOR of each slot's history, maintained
// incrementally by the reducer's state updaters; it sits at the last folded event's
// schema version, which may be below the slot's latest. The live view is the (tiny)
// pending tail, then the transient tail, folded onto that stored base and migrated to
// the latest version in selectors. The log stays the source of truth: historyViews is
// a pure fold of it, never edited directly.
export type EventDocWorkspaceState = {
  history: Record<string, EventDocEvent[]>;
  pending: Record<string, EventDocEvent[]>;
  transient: Record<string, Record<string, EventDocEvent[]>>;
  historyViews: Record<string, unknown>;
  slots: Record<string, EventDocWorkspaceSlotState>;
};

const mapFromSlotKeys = <T>(slotKeys: string[], createValue: () => T): Record<string, T> =>
  Object.fromEntries(slotKeys.map((slotKey) => [slotKey, createValue()]));

// Takes the slot configs (not just keys) because historyViews seeds each slot's
// createInitialViewState().
export const createInitialEventDocWorkspaceState = (slots: EventDocWorkspaceSlotFoldsConfig): EventDocWorkspaceState => {
  const slotKeys = Object.keys(slots);

  return {
    history: mapFromSlotKeys(slotKeys, () => []),
    pending: mapFromSlotKeys(slotKeys, () => []),
    transient: mapFromSlotKeys(slotKeys, () => ({})),
    historyViews: Object.fromEntries(Object.entries(slots).map(([slotKey, slot]) => [slotKey, slot.createInitialViewState()])),
    slots: mapFromSlotKeys(slotKeys, createInitialEventDocWorkspaceSlotState),
  };
};
