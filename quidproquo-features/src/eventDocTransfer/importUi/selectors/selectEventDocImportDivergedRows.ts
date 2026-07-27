import { EventDocTransferPlanRow, EventDocTransferStatus } from '../../models';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

// The rows a forced overwrite would act on. Deliberately Diverged only: a code conflict is blocking
// too, but overwriting the doc's own tail cannot free a code another doc holds.
export const selectEventDocImportDivergedRows = (state: EventDocImportUiState): EventDocTransferPlanRow[] =>
  state.rows.filter((row) => row.status === EventDocTransferStatus.Diverged);
