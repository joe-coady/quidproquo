import { EventDocEvent } from '../../models';
import { foldSlotPendingTail } from '../logic/foldSlotPendingTail';
import { getSlotHistoryView } from '../logic/getSlotHistoryView';
import { getSlotPending } from '../logic/getSlotPending';
import { getSlotTransientEvents } from '../logic/getSlotTransientEvents';
import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';

// The live view for one slot: the pending tail, then the transient merge, folded (in
// that block order) onto the STORED history accumulator (maintained incrementally by
// the reducer; history is never refolded at read), then migrated to the slot's latest
// version — the stored accumulator may sit below it, so the pending fold ALWAYS runs,
// even with no pending. The transient fold reuses the same tail fold, so document
// slots keep the version guard over transient events too. Memoized on the (stored
// view, pending, transient record) identities, so while you type only the tails
// refold and the migrate cost is paid once per stream change.
export const createSlotViewSelector = (slotKey: string, slot: EventDocWorkspaceSlotConfig): EventDocWorkspaceSelector<unknown> => {
  let hasCachedView = false;
  let cachedHistoryView: unknown;
  let cachedPending: EventDocEvent[] | undefined;
  let cachedTransientRecord: Record<string, EventDocEvent[]> | undefined;
  let cachedView: unknown;

  return (state) => {
    const historyView = getSlotHistoryView<unknown>(state, slotKey);
    const pending = getSlotPending(state, slotKey);
    const transientRecord = state.transient[slotKey];

    if (hasCachedView && historyView === cachedHistoryView && pending === cachedPending && transientRecord === cachedTransientRecord) {
      return cachedView;
    }

    const transientEvents = getSlotTransientEvents(state, slotKey);
    const viewWithPending = foldSlotPendingTail(slot, historyView, pending);

    cachedHistoryView = historyView;
    cachedPending = pending;
    cachedTransientRecord = transientRecord;
    // Skip the second fold when there is nothing transient: the pending fold already
    // migrated to latest, so refolding an empty tail would only churn allocations.
    cachedView = transientEvents.length === 0 ? viewWithPending : foldSlotPendingTail(slot, viewWithPending, transientEvents);
    hasCachedView = true;

    return cachedView;
  };
};
