import { EventDocWorkspaceSlotsConfig } from '../../types/EventDocWorkspaceSlotsConfig';
import { createInitialEventDocWorkspaceState, EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

// Back to pristine for the SAME slots (keys are fixed at definition time), so a
// remounted workspace doesn't resume a previous session's streams. Closured over the
// slot configs because the initial state reseeds each slot's initial history view.
export const createResetUpdater = (slots: EventDocWorkspaceSlotsConfig) => (): EventDocWorkspaceState => createInitialEventDocWorkspaceState(slots);
