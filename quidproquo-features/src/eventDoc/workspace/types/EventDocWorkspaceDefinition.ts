import { EventDocWorkspaceSlotsConfig } from './EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceTransport } from './EventDocWorkspaceTransport';

export type EventDocWorkspaceDefinition<TSlots extends EventDocWorkspaceSlotsConfig> = {
  // slotKey → event doc definition (createEventDocDefinition), mounted verbatim.
  slots: TSlots;
  // Needed only when the workspace has saved docs to load/save; all-unsaved
  // workspaces stay zero-config (see EventDocWorkspaceTransport).
  transport?: EventDocWorkspaceTransport;
};
