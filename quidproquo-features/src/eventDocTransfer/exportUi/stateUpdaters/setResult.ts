import type { EventDocExportUiSetResultPayload } from '../effects/EventDocExportUiSetResultEffect';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

// The result carries the manifest the bundle actually covered, so the dialog switches to reporting
// what went in rather than what was proposed.
export const setResult = (state: EventDocExportUiState, { result }: EventDocExportUiSetResultPayload): EventDocExportUiState => ({
  ...state,
  result,
  items: result.items,
  isExporting: false,
});
