import { EventDocWorkspaceLocalSlotConfig } from '../types/EventDocWorkspaceLocalSlotConfig';
import { EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { eventDocWorkspaceChromeApi } from './eventDocWorkspaceChromeApi';
import { eventDocWorkspaceChromeSlotFold } from './eventDocWorkspaceChromeSlotFold';

export type EventDocWorkspaceChromeSlot = EventDocWorkspaceLocalSlotConfig<EventDocWorkspaceChromeState, typeof eventDocWorkspaceChromeApi>;

// The standard chrome slot every workspace gets by default; define your own `chrome`
// slot to replace it. No coalesceEventTypes = the local-slot 'all' default, so each
// chrome field keeps only its latest event.
export const eventDocWorkspaceChromeSlot: EventDocWorkspaceChromeSlot = {
  ...eventDocWorkspaceChromeSlotFold,
  api: eventDocWorkspaceChromeApi,
};
