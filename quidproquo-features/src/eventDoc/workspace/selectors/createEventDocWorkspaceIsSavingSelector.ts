import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';

// Only document slots ever save; scoping to their keys keeps the aggregate honest even
// if a local slot's status were ever touched.
export const createEventDocWorkspaceIsSavingSelector =
  (documentSlotKeys: string[]): EventDocWorkspaceSelector<boolean> =>
  (state) =>
    documentSlotKeys.some((slotKey) => state.slots[slotKey]?.isSaving ?? false);
