import type { EventDocImportUiSetErrorPayload } from '../effects/EventDocImportUiSetErrorEffect';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

export const setError = (state: EventDocImportUiState, { error }: EventDocImportUiSetErrorPayload): EventDocImportUiState => ({
  ...state,
  error,
  isLoading: false,
  isApplying: false,
});
