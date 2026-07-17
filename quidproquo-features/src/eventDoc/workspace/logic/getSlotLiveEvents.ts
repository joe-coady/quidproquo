import { EventDocEvent } from '../../models';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';
import { getSlotHistory } from './getSlotHistory';
import { getSlotPending } from './getSlotPending';

// The live log of one slot: the saved history plus the unsaved pending tail — the
// array every fold and validation runs over. Plain and unmemoized; the view selectors
// keep their own reference-equality caches over the two streams.
export const getSlotLiveEvents = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => [
  ...getSlotHistory(state, slotKey),
  ...getSlotPending(state, slotKey),
];
