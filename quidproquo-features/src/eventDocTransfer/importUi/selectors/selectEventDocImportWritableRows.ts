import { EventDocTransferPlanRow, EventDocTransferStatus } from '../../models';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

// The rows an import would actually write. New and FastForward are the only statuses that write of
// their own accord; everything else is satisfied already or blocking.
export const selectEventDocImportWritableRows = (state: EventDocImportUiState): EventDocTransferPlanRow[] =>
  state.rows.filter((row) => row.status === EventDocTransferStatus.New || row.status === EventDocTransferStatus.FastForward);
