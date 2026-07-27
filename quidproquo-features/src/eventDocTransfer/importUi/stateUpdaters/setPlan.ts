import type { EventDocImportUiSetPlanPayload } from '../effects/EventDocImportUiSetPlanEffect';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

// A fresh plan always lands as un-applied, so re-planning after an import puts the screen back into
// the review state rather than leaving a stale "done" report on screen.
export const setPlan = (state: EventDocImportUiState, { transferId, source, rows }: EventDocImportUiSetPlanPayload): EventDocImportUiState => ({
  ...state,
  transferId,
  source,
  rows,
  isApplied: false,
  isLoading: false,
  error: null,
});
