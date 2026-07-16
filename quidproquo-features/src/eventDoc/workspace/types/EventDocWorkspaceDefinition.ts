import { EventDocWorkspaceSlotsConfig } from './EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceTransport } from './EventDocWorkspaceTransport';

export type EventDocWorkspaceDefinition<TSlots extends EventDocWorkspaceSlotsConfig> = {
  slots: TSlots;
  // Needed only when the workspace has document slots to load/save; all-local
  // workspaces stay zero-config (see EventDocWorkspaceTransport).
  transport?: EventDocWorkspaceTransport;
};
