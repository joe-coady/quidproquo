import { EventDocEvent } from '../../models';
import { noEvents } from '../constants/noEvents';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

const byCreatedAt = (a: EventDocEvent, b: EventDocEvent): number => a.payload.metadata.createdAt.localeCompare(b.payload.metadata.createdAt);

// One slot's transient events across ALL its transientKeys, merged and ordered by
// metadata.createdAt. Ties are deterministic: the keys are visited in lexical order
// and the sort is stable, so equal timestamps keep (transientKey, array position)
// order. Pure and unmemoized like its getSlot* siblings — the view selector memoizes
// on the slot's transient record identity, so this only reruns when the record
// changes — but an empty record returns the SAME noEvents reference so memo keys and
// reference-equality checks stay stable.
export const getSlotTransientEvents = (state: EventDocWorkspaceState, slotKey: string): EventDocEvent[] => {
  const slotTransient = state.transient[slotKey] ?? {};
  // Sort the transientKeys: Object.keys is insertion-ordered (a runtime-history
  // artifact of which connection wrote first), so lexical key order is what makes
  // the merge — and the stable sort's tie-break below — deterministic.
  const merged = Object.keys(slotTransient)
    .sort()
    .flatMap((transientKey) => slotTransient[transientKey]);

  if (merged.length === 0) {
    return noEvents;
  }

  // flatMap already produced a fresh array, so the in-place (stable) sort is safe.
  return merged.sort(byCreatedAt);
};
