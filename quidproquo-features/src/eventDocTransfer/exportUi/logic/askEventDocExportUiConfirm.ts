import { askCatch, AskResponse, Nullable } from 'quidproquo-core';

import { EventDocDocRef, EventDocTransferExportResult } from '../../models';
import { askUIEventDocExportSetError } from '../actionCreators/askUIEventDocExportSetError';
import { askUIEventDocExportSetExporting } from '../actionCreators/askUIEventDocExportSetExporting';
import { askUIEventDocExportSetResult } from '../actionCreators/askUIEventDocExportSetResult';
import { askEventDocExportFetch } from '../transport/askEventDocExportFetch';

/**
 * Build the bundle and hand the result back to the caller AS WELL as into state: the view starts the
 * browser download in the same click handler it called this from, which keeps the download out of an
 * effect hook. Null means it failed and the error is already in state.
 */
export function* askEventDocExportUiConfirm(serviceName: string, targets: EventDocDocRef[]): AskResponse<Nullable<EventDocTransferExportResult>> {
  yield* askUIEventDocExportSetExporting(true);
  yield* askUIEventDocExportSetError(null);

  const result = yield* askCatch(askEventDocExportFetch(serviceName, targets), askUIEventDocExportSetExporting(false));

  if (!result.success) {
    yield* askUIEventDocExportSetError('Export failed.');
    return null;
  }

  yield* askUIEventDocExportSetResult(result.result);

  return result.result;
}
