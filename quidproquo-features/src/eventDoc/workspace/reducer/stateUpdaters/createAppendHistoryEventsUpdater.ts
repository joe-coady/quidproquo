import { EventDocWorkspaceAppendHistoryEventsPayload } from '../../effects/EventDocWorkspaceAppendHistoryEventsEffect';
import { EventDocWorkspaceSlotFoldsConfig } from '../../types/EventDocWorkspaceSlotFoldsConfig';
import { EventDocWorkspaceState } from '../../types/EventDocWorkspaceState';
import { appendSlotHistoryEvents } from './appendSlotHistoryEvents';

// A refresh tail: append the fetched server events and fold ONLY them into the stored
// view (never a whole-log refold).
export const createAppendHistoryEventsUpdater =
  (slots: EventDocWorkspaceSlotFoldsConfig) =>
  (state: EventDocWorkspaceState, { slotKey, events }: EventDocWorkspaceAppendHistoryEventsPayload): EventDocWorkspaceState =>
    appendSlotHistoryEvents(slots, state, slotKey, events);
