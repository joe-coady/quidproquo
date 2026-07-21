import { EventDocWorkspaceSnapshot } from '../types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// Capture the carry-across-runtimes part of a workspace's state: identity, pending,
// and held history per DOCUMENT slot that has been initialised (history rides along
// so the restore renders instantly and only tail-pulls the delta), and the pending
// stream per LOCAL slot (session state like the editor's active tab and chrome
// panels — a local slot's pending IS its whole state, since locals never save and
// fold from pending alone). Empty local streams are skipped: restoring nothing and
// restoring an empty stream fold identically. Pure data in, pure data out.
export const createEventDocWorkspaceSnapshot = (
  state: EventDocWorkspaceState,
  documentSlotKeys: string[],
  localSlotKeys: string[],
): EventDocWorkspaceSnapshot => ({
  slots: Object.fromEntries(
    documentSlotKeys.flatMap((slotKey) => {
      const documentIdentity = state.slots[slotKey]?.documentIdentity;

      if (!documentIdentity) {
        return [];
      }

      return [[slotKey, { documentIdentity, pending: state.pending[slotKey] ?? [], history: state.history[slotKey] ?? [] }]];
    }),
  ),
  localSlots: Object.fromEntries(
    localSlotKeys.flatMap((slotKey) => {
      const pending = state.pending[slotKey] ?? [];

      return pending.length > 0 ? [[slotKey, pending]] : [];
    }),
  ),
});
