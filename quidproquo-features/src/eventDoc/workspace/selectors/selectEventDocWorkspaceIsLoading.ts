import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

export const selectEventDocWorkspaceIsLoading = (state: EventDocWorkspaceState): boolean =>
  Object.values(state.slots).some((slotState) => slotState.isLoading);
