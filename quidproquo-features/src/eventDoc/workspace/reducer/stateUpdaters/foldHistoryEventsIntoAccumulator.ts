import { replayEffects } from 'quidproquo-core';

import { foldEventDocLogStep } from '../../../fold/foldEventDocLogStep';
import { EventDocDocument, EventDocEvent } from '../../../models';
import { EventDocWorkspaceSlotConfig } from '../../types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from '../../types/EventDocWorkspaceSlotKind';

// Fold history events onto the stored ACCUMULATOR (used for both the init full fold
// and the append/refresh tails). Document slots run the shared foldEventDocLogStep
// per event and nothing else: the stored view stays at the last folded event's
// version, exactly as a foldEventDocLog of the same events would hold it mid-fold.
// Deliberately NO migrate-to-latest here and NO below-version guard: force-migrating
// the stored view broke docs whose whole log sits below the slot's latest (init
// climbed the view to latest, then a perfectly valid same-old-version refresh tail
// tripped the guard). The backend enforces event ordering; the migrate-to-latest now
// happens at read (foldEventDocLiveView / the view selector). Local slots are plain
// replays (no migrations, no updatedAt stamping).
export const foldHistoryEventsIntoAccumulator = (slot: EventDocWorkspaceSlotConfig, accumulator: unknown, events: EventDocEvent[]): unknown => {
  if (slot.kind !== EventDocWorkspaceSlotKind.document) {
    return replayEffects(accumulator, slot.foldReducer, events);
  }

  const migrations = slot.migrations ?? {};
  const latestVersion = slot.schemaVersion ?? 1;

  let next = accumulator as EventDocDocument;

  for (const event of events) {
    next = foldEventDocLogStep(next, event, { reducer: slot.foldReducer, migrations, latestVersion });
  }

  return next;
};
