import { QpqReducer } from 'quidproquo-core';

import { EventDocWorkspaceChromeSlot } from './chrome/eventDocWorkspaceChromeSlot';
import { EventDocWorkspaceEffects } from './effects/EventDocWorkspaceEffects';
import { EventDocWorkspaceBuiltInApi } from './types/EventDocWorkspaceBuiltInApi';
import { EventDocWorkspaceSelectors } from './types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotApiOf } from './types/EventDocWorkspaceSlotApiOf';
import { EventDocWorkspaceSlotsConfig } from './types/EventDocWorkspaceSlotsConfig';
import { EventDocWorkspaceState } from './types/EventDocWorkspaceState';

// A `chrome` slot is included by default; defining your own replaces it.
export type EventDocWorkspaceResolvedSlots<TSlots extends EventDocWorkspaceSlotsConfig> = 'chrome' extends keyof TSlots
  ? TSlots
  : TSlots & { chrome: EventDocWorkspaceChromeSlot };

// The parts createEventDocWorkspace returns: a keyed api (every slot's verbs bound to
// its stream, plus the workspace built-ins), the routing reducer, the initial state,
// and fold selectors.
export type EventDocWorkspace<TSlots extends EventDocWorkspaceSlotsConfig> = {
  api: { [K in keyof TSlots]: EventDocWorkspaceSlotApiOf<TSlots[K]> } & { workspace: EventDocWorkspaceBuiltInApi };
  reducer: QpqReducer<EventDocWorkspaceState, EventDocWorkspaceEffects>;
  createInitialState: () => EventDocWorkspaceState;
  selectors: EventDocWorkspaceSelectors<TSlots>;
};
