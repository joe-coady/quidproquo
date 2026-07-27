import type { EventDocImportUiSetApplyingPayload } from '../effects/EventDocImportUiSetApplyingEffect';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

export const setApplying = (state: EventDocImportUiState, { isApplying }: EventDocImportUiSetApplyingPayload): EventDocImportUiState => ({
  ...state,
  isApplying,
});
