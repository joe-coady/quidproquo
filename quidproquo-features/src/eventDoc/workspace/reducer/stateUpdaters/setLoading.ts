import { EventDocWorkspaceSetLoadingPayload } from '../../effects/EventDocWorkspaceSetLoadingEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { updateSlotState } from './updateSlotState';

export const setLoading = (state: EventDocWorkspaceState, { slotKey, isLoading }: EventDocWorkspaceSetLoadingPayload): EventDocWorkspaceState =>
  updateSlotState(state, slotKey, { isLoading });
