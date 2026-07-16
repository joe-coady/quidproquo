import { replayEffects } from 'quidproquo-core';

import { foldEventDocLog } from '../../fold';
import { EventDocEvent } from '../../models';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';

// Fold the SAVED log. Document slots fold with the migration-aware log fold so
// mixed-version logs resolve to the latest shape; local slots are plain replays.
export const foldSlotHistory = (slot: EventDocWorkspaceSlotConfig, history: EventDocEvent[]): unknown => {
  if (slot.kind === EventDocWorkspaceSlotKind.document) {
    return foldEventDocLog(history, {
      seed: slot.createInitialViewState(),
      reducer: slot.foldReducer,
      migrations: slot.migrations ?? {},
      latestVersion: slot.schemaVersion ?? 1,
    });
  }

  return replayEffects(slot.createInitialViewState(), slot.foldReducer, history);
};
