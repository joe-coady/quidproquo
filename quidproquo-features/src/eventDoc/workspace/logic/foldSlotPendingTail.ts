import { replayEffects } from 'quidproquo-core';

import { foldEventDocLiveView } from '../../fold/foldEventDocLiveView';
import { EventDocDocument, EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotFoldConfig } from '../types/EventDocWorkspaceSlotFoldConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';

// Fold an unsaved tail (the pending buffer, and again for the transient merge — see
// createSlotViewSelector) onto a stored base to produce the live view. Document slots
// go through the shared read-side fold: tail events must be authored at the slot's
// latest version (a mismatch throws — a stale client wrote the buffer), so the
// version guard covers transient events too, and the result is migrated to the latest
// version at the end, so the live view is ALWAYS latest-shaped even when the stored
// accumulator (and an empty pending) sit below it. Local slots are plain replays (no
// versions, no migrations).
export const foldSlotPendingTail = (slot: EventDocWorkspaceSlotFoldConfig, view: unknown, pending: EventDocEvent[]): unknown => {
  if (slot.kind !== EventDocWorkspaceSlotKind.document) {
    return replayEffects(view, slot.foldReducer, pending);
  }

  return foldEventDocLiveView(view as EventDocDocument, pending, {
    reducer: slot.foldReducer,
    migrations: slot.migrations ?? {},
    latestVersion: slot.schemaVersion ?? 1,
  });
};
