import { askCatch, AskResponse } from 'quidproquo-core';

import { askEventDocListFetchAll } from '../../../eventDoc/list/transport/askEventDocListFetchAll';
import { askUIEventDocExportOpen } from '../actionCreators/askUIEventDocExportOpen';
import { askUIEventDocExportSetCandidates } from '../actionCreators/askUIEventDocExportSetCandidates';
import { askUIEventDocExportSetError } from '../actionCreators/askUIEventDocExportSetError';

// Open the dialog and load what there is to choose from. Reuses the collection's ordinary list route
// rather than anything transfer-specific: the candidates ARE the collection.
export function* askEventDocExportUiOpen(serviceName: string, basePath: string): AskResponse<void> {
  yield* askUIEventDocExportOpen();

  const result = yield* askCatch(askEventDocListFetchAll(serviceName, basePath));

  if (!result.success) {
    yield* askUIEventDocExportSetError('Could not load the documents to choose from.');
    return;
  }

  yield* askUIEventDocExportSetCandidates(result.result);
}
