import { createEventDocDefinition } from '../../definition/createEventDocDefinition';
import { EventDocWorkspaceLocalSlotConfig } from '../types/EventDocWorkspaceLocalSlotConfig';
import { EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { eventDocWorkspaceChromeApi } from './eventDocWorkspaceChromeApi';
import { eventDocWorkspaceChromeSlotFold } from './eventDocWorkspaceChromeSlotFold';

export type EventDocWorkspaceChromeSlot = EventDocWorkspaceLocalSlotConfig<EventDocWorkspaceChromeState, typeof eventDocWorkspaceChromeApi>;

// The standard chrome doc every workspace gets by default; define your own `chrome`
// slot to replace it. Just an ordinary unsaved event doc definition. No
// coalesceEventTypes = the unsaved 'all' default, so each chrome field keeps only
// its latest event.
export const eventDocWorkspaceChromeSlot: EventDocWorkspaceChromeSlot = createEventDocDefinition({
  saved: false,
  foldReducer: eventDocWorkspaceChromeSlotFold.foldReducer,
  createInitialViewState: eventDocWorkspaceChromeSlotFold.createInitialViewState,
  api: eventDocWorkspaceChromeApi,
});
