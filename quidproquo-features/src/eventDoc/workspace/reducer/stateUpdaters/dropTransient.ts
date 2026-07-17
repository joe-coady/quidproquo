import { EventDocWorkspaceDropTransientPayload } from '../../effects/EventDocWorkspaceDropTransientEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Remove one transientKey's entry from EVERY slot's transient record: the key is the
// drop unit (usually a websocket connection id), so its observations vanish across the
// whole workspace at once and the folded views revert reactively. Immutable, and a
// no-op (same references) wherever the key is absent, so untouched slots keep their
// record identity for the view selectors' memo keys.
export const dropTransient = (state: EventDocWorkspaceState, { transientKey }: EventDocWorkspaceDropTransientPayload): EventDocWorkspaceState => {
  const holdingSlotKeys = Object.keys(state.transient).filter((slotKey) => transientKey in state.transient[slotKey]);

  if (holdingSlotKeys.length === 0) {
    return state;
  }

  const transient = { ...state.transient };

  for (const slotKey of holdingSlotKeys) {
    transient[slotKey] = Object.fromEntries(Object.entries(transient[slotKey]).filter(([key]) => key !== transientKey));
  }

  return { ...state, transient };
};
