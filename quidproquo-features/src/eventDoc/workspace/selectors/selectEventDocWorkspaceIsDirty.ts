import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// Dirtiness is just unsaved pending events in ANY slot; local slots keep pending
// empty so they never count.
export const selectEventDocWorkspaceIsDirty = (state: EventDocWorkspaceState): boolean =>
  Object.values(state.pending).some((events) => events.length > 0);
