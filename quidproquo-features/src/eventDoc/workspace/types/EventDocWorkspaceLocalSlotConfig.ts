import { CoalesceEventType } from './CoalesceEventType';
import { EventDocWorkspaceSlotConfigBase } from './EventDocWorkspaceSlotConfigBase';
import { EventDocWorkspaceSlotKind } from './EventDocWorkspaceSlotKind';
import { EventDocWorkspaceStoryApi } from './EventDocWorkspaceStoryApi';

export type EventDocWorkspaceLocalSlotConfig<
  TView = unknown,
  TApi extends EventDocWorkspaceStoryApi = EventDocWorkspaceStoryApi,
> = EventDocWorkspaceSlotConfigBase<TView, TApi> & {
  kind: EventDocWorkspaceSlotKind.local;
  // Omitted = last-write-wins for EVERY type, so session streams don't grow one
  // entry per interaction. An explicit list opts back into append semantics for
  // unlisted types.
  coalesceEventTypes?: CoalesceEventType[];
};
