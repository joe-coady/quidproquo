import { askCatch, AskResponse } from 'quidproquo-core';

import { EventDocTransferPlanRow } from '../../models';
import { askUIEventDocImportSetApplying } from '../actionCreators/askUIEventDocImportSetApplying';
import { askUIEventDocImportSetError } from '../actionCreators/askUIEventDocImportSetError';
import { askUIEventDocImportSetResult } from '../actionCreators/askUIEventDocImportSetResult';
import { askEventDocImportFetch } from '../transport/askEventDocImportFetch';

// Apply the plan the operator just reviewed. The backend re-plans each doc as it goes, so a doc that
// changed since the review is re-judged rather than written blindly - which is also what keeps
// `force` honest: it can only ever fire on a doc that is still diverged at write time.
export function* askEventDocImportUiApply(serviceName: string, transferId: string, force = false): AskResponse<EventDocTransferPlanRow[]> {
  yield* askUIEventDocImportSetApplying(true);
  yield* askUIEventDocImportSetError(null);

  const result = yield* askCatch(askEventDocImportFetch(serviceName, transferId, force), askUIEventDocImportSetApplying(false));

  if (!result.success) {
    yield* askUIEventDocImportSetError('Import failed.');
    return [];
  }

  yield* askUIEventDocImportSetResult(result.result);

  return result.result;
}
