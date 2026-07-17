import { Nullable } from 'quidproquo-core';

import { EventDocWorkspaceSlotError } from '../types/EventDocWorkspaceSlotError';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// First non-null slot error, for a single workspace-level error surface. Typed: the
// consumer decides how to phrase it from the operation + QPQError.
export const selectEventDocWorkspaceError = (state: EventDocWorkspaceState): Nullable<EventDocWorkspaceSlotError> =>
  Object.values(state.slots)
    .map((slotState) => slotState.error)
    .find((slotError) => slotError !== null) ?? null;
