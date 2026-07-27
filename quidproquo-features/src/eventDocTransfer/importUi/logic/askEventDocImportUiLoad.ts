import { askCatch, AskResponse } from 'quidproquo-core';

import { EventDocTransferPlanResult } from '../../models';
import { askUIEventDocImportSetError } from '../actionCreators/askUIEventDocImportSetError';
import { askUIEventDocImportSetLoading } from '../actionCreators/askUIEventDocImportSetLoading';
import { askUIEventDocImportSetPlan } from '../actionCreators/askUIEventDocImportSetPlan';
import { askEventDocBundleUpload } from '../transport/askEventDocBundleUpload';
import { askEventDocPlanFetch } from '../transport/askEventDocPlanFetch';
import { askEventDocUploadTargetFetch } from '../transport/askEventDocUploadTargetFetch';

type LoadedBundle = EventDocTransferPlanResult & {
  transferId: string;
};

// The whole read-only half of an import as ONE story, so a single askCatch covers every step: ask for
// somewhere to put the file, put it there, read back what importing it would do.
function* askEventDocImportUiUploadAndPlan(serviceName: string, file: File): AskResponse<LoadedBundle> {
  const target = yield* askEventDocUploadTargetFetch(serviceName);

  yield* askEventDocBundleUpload(target.uploadUrl, file);

  const planResult = yield* askEventDocPlanFetch(serviceName, target.transferId);

  return { transferId: target.transferId, ...planResult };
}

// Upload the chosen file, then plan it. Deliberately one verb: an uploaded bundle with no plan is a
// dead end for the operator, and planning writes nothing, so there is nothing to confirm yet.
export function* askEventDocImportUiLoad(serviceName: string, file: File): AskResponse<void> {
  yield* askUIEventDocImportSetLoading(true);
  yield* askUIEventDocImportSetError(null);

  const loaded = yield* askCatch(askEventDocImportUiUploadAndPlan(serviceName, file), askUIEventDocImportSetLoading(false));

  if (!loaded.success) {
    yield* askUIEventDocImportSetError('Could not read that bundle. Is it a file exported from this app?');
    return;
  }

  yield* askUIEventDocImportSetPlan(loaded.result.transferId, loaded.result.source, loaded.result.rows);
}
