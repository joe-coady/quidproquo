import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

export const selectEventDocWorkspaceIsSaving = (state: EventDocWorkspaceState): boolean =>
  Object.values(state.slots).some((slotState) => slotState.isSaving);
