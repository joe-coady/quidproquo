import type { EventDocImportUiSetResultPayload } from '../effects/EventDocImportUiSetResultEffect';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

export const setResult = (state: EventDocImportUiState, { rows }: EventDocImportUiSetResultPayload): EventDocImportUiState => ({
  ...state,
  rows,
  isApplied: true,
  isApplying: false,
});
