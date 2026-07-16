import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotsConfig } from './EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceSlotState } from './EventDocWorkspaceSlotState';
import { EventDocWorkspaceSlotViewOf } from './EventDocWorkspaceSlotViewOf';
import { EventDocWorkspaceState } from './EventDocWorkspaceState';

export type EventDocWorkspaceSelector<T> = (state: EventDocWorkspaceState) => T;

export type EventDocWorkspaceSelectors<TSlots extends EventDocWorkspaceSlotsConfig> = {
  // The live log per slot: [...history, ...pending].
  liveEvents: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocEvent[]> };
  // The folded view per slot. Memoized two-level: the saved-log fold is cached on the
  // history array's identity, so while you type only the pending tail refolds.
  view: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocWorkspaceSlotViewOf<TSlots[K]>> };
  slotState: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocWorkspaceSlotState> };
  isDirty: EventDocWorkspaceSelector<boolean>;
  isLoading: EventDocWorkspaceSelector<boolean>;
  isSaving: EventDocWorkspaceSelector<boolean>;
  // First slot error, for a single workspace-level error surface.
  error: EventDocWorkspaceSelector<Nullable<string>>;
};
