import { Nullable } from 'quidproquo-core';

import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';

// First slot error, for a single workspace-level error surface.
export const selectEventDocWorkspaceError = (state: EventDocWorkspaceState): Nullable<string> =>
  Object.values(state.slots)
    .map((slotState) => slotState.error)
    .find((slotError) => slotError !== null) ?? null;
