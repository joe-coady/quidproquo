import { EventDocWorkspaceSlotFoldConfig } from './EventDocWorkspaceSlotFoldConfig';

// The api-free `slots` map the fold machinery (selectors/reducer/initial state)
// consumes; a full EventDocWorkspaceSlotsConfig is assignable to it.
export type EventDocWorkspaceSlotFoldsConfig = Record<string, EventDocWorkspaceSlotFoldConfig>;
