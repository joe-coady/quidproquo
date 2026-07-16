import { createInitialEventDocWorkspaceState, EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Back to pristine for the SAME slot keys (keys are fixed at definition time), so a
// remounted workspace doesn't resume a previous session's streams.
export const reset = (state: EventDocWorkspaceState): EventDocWorkspaceState => createInitialEventDocWorkspaceState(Object.keys(state.slots));
