import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// Typed read of one slot's STORED history view (maintained incrementally by the
// reducer). This is the RAW fold accumulator: it sits at the LAST FOLDED EVENT's
// schema version, which may be BELOW the slot's latest (a doc whose whole log
// predates the current schema stays at its authored version here). Latest-shaped
// reads go through the view selector or foldEventDocLiveView, which fold the pending
// tail and migrate to the latest version at read time.
export const getSlotHistoryView = <TView>(state: EventDocWorkspaceState, slotKey: string): TView => state.historyViews[slotKey] as TView;
