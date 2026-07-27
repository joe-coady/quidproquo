import { createInitialEventDocExportUiState, type EventDocExportUiState } from '../types/EventDocExportUiState';

// Opening always starts from pristine, so a reopened dialog never shows a stale manifest, a spent
// download link, or last time's ticks. Loading is on immediately: candidates are fetched next.
export const open = (): EventDocExportUiState => ({
  ...createInitialEventDocExportUiState(),
  isOpen: true,
  isLoading: true,
});
