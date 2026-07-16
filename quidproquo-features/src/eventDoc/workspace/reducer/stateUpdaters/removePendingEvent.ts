import { EventDocWorkspaceRemovePendingEventPayload } from '../../effects/EventDocWorkspaceRemovePendingEventEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

export const removePendingEvent = (
  state: EventDocWorkspaceState,
  { slotKey, clientMessageId }: EventDocWorkspaceRemovePendingEventPayload,
): EventDocWorkspaceState =>
  slotKey in state.slots
    ? {
        ...state,
        pending: {
          ...state.pending,
          [slotKey]: (state.pending[slotKey] ?? []).filter((event) => event.payload.metadata.clientMessageId !== clientMessageId),
        },
      }
    : state;
