import { EventDocEvent } from '../../models';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';
import { getSlotHistory } from './getSlotHistory';
import { getSlotPending } from './getSlotPending';

// The live events of one slot: the held history plus the unsaved pending tail.
// NOT the whole log — a bootstrap-loaded slot's history starts after its fold base
// (state.bases), so this is "everything since the base"; only a base-less slot holds
// the log from event zero. A consumer needing the complete log (the history dialog)
// fetches it from the server instead. Transient events are deliberately excluded:
// they never save, so they must never influence validation or the History panel (use
// getSlotTransientEvents for the transient merge). Plain and unmemoized; the view
// selectors keep their own reference-equality caches over the streams.
export const getSlotLiveEvents = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => [
  ...getSlotHistory(state, slotKey),
  ...getSlotPending(state, slotKey),
];
