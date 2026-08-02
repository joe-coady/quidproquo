import { Nullable } from 'quidproquo-core';

import { EventDocWorkspaceHistoryPage } from '../types/EventDocWorkspaceHistoryPage';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// One slot's on-demand newest-first history (see askLoadHistory / askLoadOlderHistory),
// or null when nothing has been loaded. The working log (getSlotHistory) starts after
// the fold base and runs oldest-first; this is the display walk backwards from the
// newest event, for consumers that show history rather than fold it. A set
// `nextPageKey` means older events remain to load.
export const getSlotFullHistory = (state: EventDocWorkspaceState, slotKey: string): Nullable<EventDocWorkspaceHistoryPage> =>
  state.fullHistory[slotKey] ?? null;
