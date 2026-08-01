import { replayEffects } from 'quidproquo-core';

import { foldEventDocLogStep } from '../../../fold/foldEventDocLogStep';
import { EventDocDocument, EventDocEvent } from '../../../models';
import { reservedEventDocEventValidators } from '../../../validation/reservedEventDocEventValidators';
import { EventDocWorkspaceSlotFoldConfig } from '../../types/EventDocWorkspaceSlotFoldConfig';
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
//
// The slot's validators are applied per event, so the editor's live view rejects exactly what
// the saved fold rejects — without them the editor happily showed an edit made after publish
// that no other reader would ever see.
//
// Only the state-based rules carry over: dedup by clientMessageId and the version floor need
// memory across the whole log, which an incremental tail fold does not have. Those matter for
// a full fold of a stored log; the lifecycle guard, which is what a user can actually trip, is
// purely state-based and works here.
export const foldHistoryEventsIntoAccumulator = (slot: EventDocWorkspaceSlotFoldConfig, accumulator: unknown, events: EventDocEvent[]): unknown => {
  if (slot.kind !== EventDocWorkspaceSlotKind.document) {
    return replayEffects(accumulator, slot.foldReducer, events);
  }

  const migrations = slot.migrations ?? {};
  const latestVersion = slot.schemaVersion ?? 1;

  // A document slot gets the lifecycle guard however it was built. Definitions supply the
  // merged set (reserved + their own); a hand-assembled slot falls back to reserved rather
  // than silently folding events every other reader rejects.
  const validators = slot.validators ?? reservedEventDocEventValidators;

  let next = accumulator as EventDocDocument;

  for (const event of events) {
    [next] = foldEventDocLogStep(next, event, { reducer: slot.foldReducer, migrations, latestVersion, validators });
  }

  return next;
};
