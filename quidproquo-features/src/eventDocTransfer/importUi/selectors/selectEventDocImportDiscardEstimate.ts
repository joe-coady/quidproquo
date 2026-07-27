import type { EventDocImportUiState } from '../types/EventDocImportUiState';
import { selectEventDocImportDivergedRows } from './selectEventDocImportDivergedRows';

/**
 * Roughly how many of the target's own events a forced overwrite would throw away, for the warning
 * the operator reads before confirming.
 *
 * An ESTIMATE, deliberately: the exact figure is the divergence index, which the plan does not carry
 * (it would mean widening the wire shape for a number only this warning wants). The event-count delta
 * is the closest thing available, floored at 1 so a doc that diverged without growing still reads as
 * destructive. The apply reports the true count per row afterwards.
 */
export const selectEventDocImportDiscardEstimate = (state: EventDocImportUiState): number =>
  selectEventDocImportDivergedRows(state).reduce((total, row) => total + Math.max(row.existingEvents - row.incomingEvents, 1), 0);
