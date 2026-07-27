import type { EventDocExportUiSetCandidatesPayload } from '../effects/EventDocExportUiSetCandidatesEffect';
import type { EventDocExportUiState } from '../types/EventDocExportUiState';

export const setCandidates = (state: EventDocExportUiState, { candidates }: EventDocExportUiSetCandidatesPayload): EventDocExportUiState => ({
  ...state,
  candidates,
  isLoading: false,
});
