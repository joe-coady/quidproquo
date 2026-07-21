import { EventDocWorkspaceLocalSlotFoldConfig } from '../types/EventDocWorkspaceLocalSlotFoldConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';
import { createInitialEventDocWorkspaceChromeState, EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { eventDocWorkspaceChromeFoldReducer } from './eventDocWorkspaceChromeFoldReducer';

export type EventDocWorkspaceChromeSlotFold = EventDocWorkspaceLocalSlotFoldConfig<EventDocWorkspaceChromeState>;

// The chrome slot's api-free fold config — what internal selector creation
// resolves in when a workspace doesn't define its own `chrome` slot. The full
// default chrome definition composes this plus the chrome api.
export const eventDocWorkspaceChromeSlotFold: EventDocWorkspaceChromeSlotFold = {
  kind: EventDocWorkspaceSlotKind.local,
  foldReducer: eventDocWorkspaceChromeFoldReducer,
  createInitialViewState: createInitialEventDocWorkspaceChromeState,
};
