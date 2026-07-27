import { EventDocTransferStatus } from '../../models';
import type { EventDocImportUiState } from '../types/EventDocImportUiState';

// How many rows an import will leave alone because something is wrong, as opposed to because there is
// nothing to do. `Same` is not blocked - it is already where the bundle wants it.
export const selectEventDocImportBlockedCount = (state: EventDocImportUiState): number =>
  state.rows.filter(
    (row) =>
      row.status === EventDocTransferStatus.Diverged ||
      row.status === EventDocTransferStatus.CodeConflict ||
      row.status === EventDocTransferStatus.Ignored,
  ).length;
