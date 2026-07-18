import { CoalesceEventType } from './CoalesceEventType';
import { EventDocWorkspaceSlotFoldConfigBase } from './EventDocWorkspaceSlotFoldConfigBase';
import { EventDocWorkspaceSlotKind } from './EventDocWorkspaceSlotKind';

// A local slot's api-free fold config (see EventDocWorkspaceSlotFoldConfigBase).
export type EventDocWorkspaceLocalSlotFoldConfig<TView = unknown> = EventDocWorkspaceSlotFoldConfigBase<TView> & {
  kind: EventDocWorkspaceSlotKind.local;
  // Omitted = last-write-wins for EVERY type, so session streams don't grow one
  // entry per interaction. An explicit list opts back into append semantics for
  // unlisted types.
  coalesceEventTypes?: CoalesceEventType[];
};
