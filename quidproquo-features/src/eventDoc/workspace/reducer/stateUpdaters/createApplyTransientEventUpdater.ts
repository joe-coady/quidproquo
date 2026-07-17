import { EventDocWorkspaceApplyTransientEventPayload } from '../../effects/EventDocWorkspaceApplyTransientEventEffect';
import { EventDocWorkspaceCoalesceRules } from '../../types/EventDocWorkspaceCoalesceRules';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { coalesceWorkspaceEvents } from '../coalesceWorkspaceEvents';

// A transient commit lands in the slot's transient group under its transientKey,
// never in pending. The slot's own coalesce rules apply WITHIN the key's array (a
// progress burst under one connection collapses; separate connections don't touch
// each other). Closured over the per-slot rules like createApplyEventUpdater. No
// renumbering: metadata.index stays 0 — transient ordering is by createdAt at read
// (see getSlotTransientEvents), not by log position.
export const createApplyTransientEventUpdater =
  (coalesceRulesBySlot: Record<string, EventDocWorkspaceCoalesceRules>) =>
  (state: EventDocWorkspaceState, { slotKey, transientKey, event }: EventDocWorkspaceApplyTransientEventPayload): EventDocWorkspaceState => {
    if (!(slotKey in state.slots)) {
      return state;
    }

    const rules = coalesceRulesBySlot[slotKey] ?? [];
    const slotTransient = state.transient[slotKey] ?? {};
    const retained = coalesceWorkspaceEvents(slotTransient[transientKey] ?? [], event, rules);

    return {
      ...state,
      transient: {
        ...state.transient,
        [slotKey]: {
          ...slotTransient,
          [transientKey]: [...retained, event],
        },
      },
    };
  };
