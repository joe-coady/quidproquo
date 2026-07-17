import { EventDocWorkspaceAppendHistoryEventPayload } from '../../effects/EventDocWorkspaceAppendHistoryEventEffect';
import { EventDocWorkspaceSlotsConfig } from '../../types/EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { appendSlotHistoryEvents } from './appendSlotHistoryEvents';

// One save landing: append the server-stamped event and fold it into the stored view.
export const createAppendHistoryEventUpdater =
  (slots: EventDocWorkspaceSlotsConfig) =>
  (state: EventDocWorkspaceState, { slotKey, event }: EventDocWorkspaceAppendHistoryEventPayload): EventDocWorkspaceState =>
    appendSlotHistoryEvents(slots, state, slotKey, [event]);
