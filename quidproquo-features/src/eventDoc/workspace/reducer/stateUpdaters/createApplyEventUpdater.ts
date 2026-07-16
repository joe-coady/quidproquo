import { EventDocWorkspaceApplyEventPayload } from '../../effects/EventDocWorkspaceApplyEventEffect';
import { EventDocWorkspaceCoalesceRules } from '../../types/EventDocWorkspaceCoalesceRules';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { coalesceWorkspaceEvents } from '../coalesceWorkspaceEvents';
import { renumberWorkspaceEvents } from '../renumberWorkspaceEvents';

// Coalesce + renumber live IN the reducer (not the commit story) so a commit is
// atomic: parallel commits each fold onto the latest state instead of racing a
// read-modify-write of the whole buffer. Closured over the per-slot rules so the
// effect payload stays lean and serializable.
export const createApplyEventUpdater =
  (coalesceRulesBySlot: Record<string, EventDocWorkspaceCoalesceRules>) =>
  (state: EventDocWorkspaceState, { slotKey, isPending, event }: EventDocWorkspaceApplyEventPayload): EventDocWorkspaceState => {
    if (!(slotKey in state.slots)) {
      return state;
    }

    const rules = coalesceRulesBySlot[slotKey] ?? [];

    if (isPending) {
      const history = state.history[slotKey] ?? [];
      const retained = coalesceWorkspaceEvents(state.pending[slotKey] ?? [], event, rules);

      return {
        ...state,
        pending: {
          ...state.pending,
          [slotKey]: renumberWorkspaceEvents([...retained, event], history.length),
        },
      };
    }

    const retained = coalesceWorkspaceEvents(state.history[slotKey] ?? [], event, rules);

    return {
      ...state,
      history: {
        ...state.history,
        [slotKey]: renumberWorkspaceEvents([...retained, event], 0),
      },
    };
  };
