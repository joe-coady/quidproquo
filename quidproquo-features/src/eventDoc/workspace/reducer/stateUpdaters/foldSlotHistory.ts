import { Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocSnapshotBase } from '../../../models';
import { EventDocWorkspaceSlotFoldConfig } from '../../types/EventDocWorkspaceSlotFoldConfig';
import { foldHistoryEventsIntoAccumulator } from './foldHistoryEventsIntoAccumulator';

// Fold a slot's saved log into its stored accumulator (the setHistoryEvents path):
// the seed run through the same per-event steps the incremental appends use, so full
// and incremental folds cannot disagree. The seed is the server-snapshot base when
// one came with the log (its era-pinned state carries the schemaVersion and dedup
// window the acceptance rules read, so resuming from it equals folding from zero) and
// the slot's initial view state otherwise. NOT foldEventDocLog — that climbs to the
// latest version at the end, and the stored view must stay at the last folded event's
// version (the migrate-to-latest belongs to the read side).
export const foldSlotHistory = (
  slot: EventDocWorkspaceSlotFoldConfig,
  history: EventDocEvent[],
  base: Nullable<EventDocSnapshotBase> = null,
): unknown => foldHistoryEventsIntoAccumulator(slot, base ? base.state : slot.createInitialViewState(), history);
