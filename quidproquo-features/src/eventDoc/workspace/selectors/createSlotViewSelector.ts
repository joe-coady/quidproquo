import { EventDocEvent } from '../../models';
import { foldSlotHistory } from '../logic/foldSlotHistory';
import { foldSlotPendingTail } from '../logic/foldSlotPendingTail';
import { getSlotHistory } from '../logic/getSlotHistory';
import { getSlotPending } from '../logic/getSlotPending';
import { EventDocWorkspaceSelector } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';

// The folded view for one slot. Memoized two-level: the saved-log fold is cached on
// the history array's identity, so while you type only the pending tail refolds.
export const createSlotViewSelector = (slotKey: string, slot: EventDocWorkspaceSlotConfig): EventDocWorkspaceSelector<unknown> => {
  let cachedHistory: EventDocEvent[] | undefined;
  let cachedHistoryView: unknown;
  let cachedPending: EventDocEvent[] | undefined;
  let cachedView: unknown;

  return (state) => {
    const history = getSlotHistory(state, slotKey);
    const pending = getSlotPending(state, slotKey);

    if (history === cachedHistory && pending === cachedPending) {
      return cachedView;
    }

    if (history !== cachedHistory) {
      cachedHistory = history;
      cachedHistoryView = foldSlotHistory(slot, history);
    }

    cachedPending = pending;
    cachedView = pending.length === 0 ? cachedHistoryView : foldSlotPendingTail(slot, cachedHistoryView, pending);

    return cachedView;
  };
};
