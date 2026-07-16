import { EventDocWorkspaceLocalSlotConfig } from '../types/EventDocWorkspaceLocalSlotConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';
import { createInitialEventDocWorkspaceChromeState, EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { eventDocWorkspaceChromeApi } from './eventDocWorkspaceChromeApi';
import { eventDocWorkspaceChromeFoldReducer } from './eventDocWorkspaceChromeFoldReducer';

export type EventDocWorkspaceChromeSlot = EventDocWorkspaceLocalSlotConfig<EventDocWorkspaceChromeState, typeof eventDocWorkspaceChromeApi>;

// The standard chrome slot every workspace gets by default; define your own `chrome`
// slot to replace it. No coalesceEventTypes = the local-slot 'all' default, so each
// chrome field keeps only its latest event.
export const eventDocWorkspaceChromeSlot: EventDocWorkspaceChromeSlot = {
  kind: EventDocWorkspaceSlotKind.local,
  api: eventDocWorkspaceChromeApi,
  foldReducer: eventDocWorkspaceChromeFoldReducer,
  createInitialViewState: createInitialEventDocWorkspaceChromeState,
};
