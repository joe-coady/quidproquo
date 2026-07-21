import { Nullable, QpqReducer } from 'quidproquo-core';

import { EventDocEvent } from '../models';
import { EventDocWorkspaceChromeSlot } from './chrome/eventDocWorkspaceChromeSlot';
import { EventDocWorkspaceEffects } from './effects/EventDocWorkspaceEffects';
import { EventDocWorkspaceBuiltInApi } from './types/EventDocWorkspaceBuiltInApi';
import { EventDocWorkspaceSelector } from './types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotApiOf } from './types/EventDocWorkspaceSlotApiOf';
import { EventDocWorkspaceSlotError } from './types/EventDocWorkspaceSlotError';
import { EventDocWorkspaceSlotsConfig } from './types/EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceSlotState } from './types/EventDocWorkspaceSlotState';
import { EventDocWorkspaceSlotViewOf } from './types/EventDocWorkspaceSlotViewOf';
import { EventDocWorkspaceSnapshot } from './types/EventDocWorkspaceSnapshot';
import { EventDocWorkspaceState } from './types/EventDocWorkspaceState';

// A `chrome` slot is included by default; defining your own replaces it.
export type EventDocWorkspaceResolvedSlots<TSlots extends EventDocWorkspaceSlotsConfig> = 'chrome' extends keyof TSlots
  ? TSlots
  : TSlots & { chrome: EventDocWorkspaceChromeSlot };

// Everything about ONE mounted doc, keyed by its slot: the bound api (every verb's
// commits and reads route to this doc's stream) and the doc's read surface — `view`
// (the memoized live fold: history base + pending tail + transients, migrated to
// latest), `liveEvents` (the persistable log: [...history, ...pending]; view is its
// fold), and `slotState` (the bookkeeping AROUND the doc: identity + isLoading /
// isSaving / error).
export type EventDocWorkspaceDoc<TSlot> = {
  api: EventDocWorkspaceSlotApiOf<TSlot>;
  view: EventDocWorkspaceSelector<EventDocWorkspaceSlotViewOf<TSlot>>;
  liveEvents: EventDocWorkspaceSelector<EventDocEvent[]>;
  slotState: EventDocWorkspaceSelector<EventDocWorkspaceSlotState>;
};

// The cross-doc aggregates: dirty/saving consider SAVED docs only (a chrome toggle
// must not mark the workspace dirty); error is the first non-null doc error, typed
// (operation + QPQError) so the consumer owns the display phrasing.
export type EventDocWorkspaceAggregateSelectors = {
  isDirty: EventDocWorkspaceSelector<boolean>;
  isLoading: EventDocWorkspaceSelector<boolean>;
  isSaving: EventDocWorkspaceSelector<boolean>;
  error: EventDocWorkspaceSelector<Nullable<EventDocWorkspaceSlotError>>;
};

// The parts createEventDocWorkspace returns: one node per mounted doc (`docs.<key>`),
// the workspace built-ins at the root api (init/save/cancel/refresh — no reserved
// slot key needed), the routing reducer, the initial state, the cross-doc aggregate
// selectors, and createSnapshot — the serializable (identity + pending) capture that
// api.askInit can restore into a DIFFERENT runtime of the same workspace (federated
// module hot-swap).
export type EventDocWorkspace<TSlots extends EventDocWorkspaceSlotsConfig> = {
  docs: { [K in keyof TSlots]: EventDocWorkspaceDoc<TSlots[K]> };
  api: EventDocWorkspaceBuiltInApi;
  reducer: QpqReducer<EventDocWorkspaceState, EventDocWorkspaceEffects>;
  createInitialState: () => EventDocWorkspaceState;
  createSnapshot: (state: EventDocWorkspaceState) => EventDocWorkspaceSnapshot;
  selectors: EventDocWorkspaceAggregateSelectors;
};
