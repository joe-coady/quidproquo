import { EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// Capture the carry-across-runtimes part of a workspace's state: identity + pending
// per DOCUMENT slot that has been initialised (local slots have no identity and are
// session-scoped by definition, so they never snapshot). Pure data in, pure data out.
export const createEventDocWorkspaceSnapshot = (state: EventDocWorkspaceState, documentSlotKeys: string[]): EventDocWorkspaceSnapshot => ({
  slots: Object.fromEntries(
    documentSlotKeys.flatMap((slotKey) => {
      const documentIdentity = state.slots[slotKey]?.documentIdentity;

      if (!documentIdentity) {
        return [];
      }

      return [[slotKey, { documentIdentity, pending: state.pending[slotKey] ?? [] }]];
    }),
  ),
});
