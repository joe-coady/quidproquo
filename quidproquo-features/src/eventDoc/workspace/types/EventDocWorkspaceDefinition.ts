import { EventDocWorkspaceResolvedFoldSlots } from './EventDocWorkspaceResolvedFoldSlots';
import { EventDocWorkspaceSelectors } from './EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotsConfig } from './EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceTransport } from './EventDocWorkspaceTransport';

export type EventDocWorkspaceDefinition<TSlots extends EventDocWorkspaceSlotsConfig> = {
  slots: TSlots;
  // Needed only when the workspace has document slots to load/save; all-local
  // workspaces stay zero-config (see EventDocWorkspaceTransport).
  transport?: EventDocWorkspaceTransport;
  // Pre-built fold selectors (createEventDocWorkspaceSelectors over the slots'
  // fold configs). Pass these when api verbs read live views through a standalone
  // selectors module — the workspace then reuses that exact instance (one shared
  // memoized selector set) instead of building its own. Omitted = built here.
  // NoInfer: TSlots must be inferred from `slots` alone — letting this position
  // contribute collapses TSlots to its constraint and unbinds every api/view type.
  selectors?: EventDocWorkspaceSelectors<EventDocWorkspaceResolvedFoldSlots<NoInfer<TSlots>>>;
};
