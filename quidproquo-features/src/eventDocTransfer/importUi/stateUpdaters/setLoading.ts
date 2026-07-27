import type { EventDocImportUiSetLoadingPayload } from '../effects/EventDocImportUiSetLoadingEffect';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

export const setLoading = (state: EventDocImportUiState, { isLoading }: EventDocImportUiSetLoadingPayload): EventDocImportUiState => ({
  ...state,
  isLoading,
});
