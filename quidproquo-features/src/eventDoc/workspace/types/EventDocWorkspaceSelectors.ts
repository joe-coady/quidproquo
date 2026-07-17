import { Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotError } from './EventDocWorkspaceSlotError';
import { EventDocWorkspaceSlotsConfig } from './EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceSlotState } from './EventDocWorkspaceSlotState';
import { EventDocWorkspaceSlotViewOf } from './EventDocWorkspaceSlotViewOf';
import { EventDocWorkspaceState } from './EventDocWorkspaceState';

export type EventDocWorkspaceSelector<T> = (state: EventDocWorkspaceState) => T;

export type EventDocWorkspaceSelectors<TSlots extends EventDocWorkspaceSlotsConfig> = {
  // The live log per slot: [...history, ...pending]. The PERSISTABLE log — transient
  // events are deliberately excluded (they never save).
  liveEvents: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocEvent[]> };
  // The folded view per slot: the pending tail, then the transient merge, folded onto
  // the stored historyViews base (maintained by the reducer), memoized on the (base,
  // pending, transient record) identities so while you type only the tails refold and
  // history is never refolded at read.
  view: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocWorkspaceSlotViewOf<TSlots[K]>> };
  slotState: { [K in keyof TSlots]: EventDocWorkspaceSelector<EventDocWorkspaceSlotState> };
  // Dirty/saving consider DOCUMENT slots only: a local slot's pending is session state
  // (a chrome toggle must not mark the workspace dirty) and it never saves.
  isDirty: EventDocWorkspaceSelector<boolean>;
  isLoading: EventDocWorkspaceSelector<boolean>;
  isSaving: EventDocWorkspaceSelector<boolean>;
  // First non-null slot error, for a single workspace-level error surface. Typed
  // (operation + QPQError) so the consumer owns the display phrasing.
  error: EventDocWorkspaceSelector<Nullable<EventDocWorkspaceSlotError>>;
};
