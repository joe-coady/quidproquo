import { EventDocEvent } from '../../models';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';
import { getSlotHistory } from './getSlotHistory';
import { getSlotPending } from './getSlotPending';

// The live log of one slot: the saved history plus the unsaved pending tail — the
// PERSISTABLE log every validation runs over. Transient events are deliberately
// excluded: they never save, so they must never influence validation or the History
// panel (use getSlotTransientEvents for the transient merge). Plain and unmemoized;
// the view selectors keep their own reference-equality caches over the streams.
export const getSlotLiveEvents = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => [
  ...getSlotHistory(state, slotKey),
  ...getSlotPending(state, slotKey),
];
