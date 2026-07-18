import { EventDocEvent } from '../../../models';
import { EventDocWorkspaceSlotFoldConfig } from '../../types/EventDocWorkspaceSlotFoldConfig';
import { foldHistoryEventsIntoAccumulator } from './foldHistoryEventsIntoAccumulator';

// Fold a slot's FULL saved log into its stored accumulator (the setHistoryEvents
// path): the initial view state run through the same per-event steps the incremental
// appends use, so full and incremental folds cannot disagree. NOT foldEventDocLog —
// that climbs to the latest version at the end, and the stored view must stay at the
// last folded event's version (the migrate-to-latest belongs to the read side).
export const foldSlotHistory = (slot: EventDocWorkspaceSlotFoldConfig, history: EventDocEvent[]): unknown =>
  foldHistoryEventsIntoAccumulator(slot, slot.createInitialViewState(), history);
