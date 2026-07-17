import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';

// Dirtiness is unsaved pending events in a DOCUMENT slot. Local slots buffer their
// commits in pending too, but that is session state (tabs, toggles) with no save
// concept, so it never counts.
export const createEventDocWorkspaceIsDirtySelector =
  (documentSlotKeys: string[]): EventDocWorkspaceSelector<boolean> =>
  (state) =>
    documentSlotKeys.some((slotKey) => (state.pending[slotKey] ?? []).length > 0);
