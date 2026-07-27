import type { EventDocExportUiSetManifestPayload } from '../effects/EventDocExportUiSetManifestEffect';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

export const setManifest = (state: EventDocExportUiState, { items }: EventDocExportUiSetManifestPayload): EventDocExportUiState => ({
  ...state,
  items,
  isLoading: false,
});
