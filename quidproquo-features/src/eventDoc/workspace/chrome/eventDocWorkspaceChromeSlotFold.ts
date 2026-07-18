import { EventDocWorkspaceLocalSlotFoldConfig } from '../types/EventDocWorkspaceLocalSlotFoldConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';
import { createInitialEventDocWorkspaceChromeState, EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { eventDocWorkspaceChromeFoldReducer } from './eventDocWorkspaceChromeFoldReducer';

export type EventDocWorkspaceChromeSlotFold = EventDocWorkspaceLocalSlotFoldConfig<EventDocWorkspaceChromeState>;

// The chrome slot's api-free fold config — what standalone selector creation
// (createEventDocWorkspaceSelectors) resolves in when a workspace doesn't define
// its own `chrome` slot. The full default slot spreads this plus the chrome api.
export const eventDocWorkspaceChromeSlotFold: EventDocWorkspaceChromeSlotFold = {
  kind: EventDocWorkspaceSlotKind.local,
  foldReducer: eventDocWorkspaceChromeFoldReducer,
  createInitialViewState: createInitialEventDocWorkspaceChromeState,
};
