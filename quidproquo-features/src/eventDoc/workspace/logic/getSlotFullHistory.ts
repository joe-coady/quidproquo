import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// One slot's on-demand COMPLETE saved log (see askLoadHistory), or null when it has
// not been loaded. The working log (getSlotHistory) starts after the fold base; this
// is the whole thing from event zero, for consumers that display history rather than
// fold it.
export const getSlotFullHistory = (state: EventDocWorkspaceState, slotKey: string): Nullable<EventDocEvent[]> =>
  state.fullHistory[slotKey] ?? null;
