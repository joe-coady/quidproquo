import { EventDocWorkspaceAppendHistoryEventPayload } from '../../effects/EventDocWorkspaceAppendHistoryEventEffect';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';

export const appendHistoryEvent = (
  state: EventDocWorkspaceState,
  { slotKey, event }: EventDocWorkspaceAppendHistoryEventPayload,
): EventDocWorkspaceState =>
  slotKey in state.slots ? { ...state, history: { ...state.history, [slotKey]: [...(state.history[slotKey] ?? []), event] } } : state;
