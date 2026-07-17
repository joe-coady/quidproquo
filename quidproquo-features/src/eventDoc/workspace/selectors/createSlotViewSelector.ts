import { EventDocEvent } from '../../models';
import { foldSlotPendingTail } from '../logic/foldSlotPendingTail';
import { getSlotHistoryView } from '../logic/getSlotHistoryView';
import { getSlotPending } from '../logic/getSlotPending';
import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';

// The live view for one slot: the pending tail folded onto the STORED history
// accumulator (maintained incrementally by the reducer; history is never refolded at
// read), then migrated to the slot's latest version — the stored accumulator may sit
// below it, so the fold ALWAYS runs, even with no pending. Memoized on the (stored
// view, pending) identities, so while you type only the pending tail refolds and the
// migrate cost is paid once per stream change.
export const createSlotViewSelector = (slotKey: string, slot: EventDocWorkspaceSlotConfig): EventDocWorkspaceSelector<unknown> => {
  let hasCachedView = false;
  let cachedHistoryView: unknown;
  let cachedPending: EventDocEvent[] | undefined;
  let cachedView: unknown;

  return (state) => {
    const historyView = getSlotHistoryView<unknown>(state, slotKey);
    const pending = getSlotPending(state, slotKey);

    if (hasCachedView && historyView === cachedHistoryView && pending === cachedPending) {
      return cachedView;
    }

    cachedHistoryView = historyView;
    cachedPending = pending;
    cachedView = foldSlotPendingTail(slot, historyView, pending);
    hasCachedView = true;

    return cachedView;
  };
};
