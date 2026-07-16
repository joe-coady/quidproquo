import { EventDocWorkspaceSetErrorPayload } from '../../effects/EventDocWorkspaceSetErrorEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { updateSlotState } from './updateSlotState';

export const setError = (state: EventDocWorkspaceState, { slotKey, error }: EventDocWorkspaceSetErrorPayload): EventDocWorkspaceState =>
  updateSlotState(state, slotKey, { error });
