import type { EventDocExportUiSetExportingPayload } from '../effects/EventDocExportUiSetExportingEffect';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

export const setExporting = (state: EventDocExportUiState, { isExporting }: EventDocExportUiSetExportingPayload): EventDocExportUiState => ({
  ...state,
  isExporting,
});
