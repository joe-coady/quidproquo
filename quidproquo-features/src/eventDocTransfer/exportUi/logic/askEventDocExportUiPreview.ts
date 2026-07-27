import { askCatch, AskResponse } from 'quidproquo-core';

import { EventDocDocRef } from '../../models';
import { askUIEventDocExportSetError } from '../actionCreators/askUIEventDocExportSetError';
import { askUIEventDocExportSetLoading } from '../actionCreators/askUIEventDocExportSetLoading';
import { askUIEventDocExportSetManifest } from '../actionCreators/askUIEventDocExportSetManifest';
import { askEventDocManifestFetch } from '../transport/askEventDocManifestFetch';

// Move from picking to reviewing: work out everything the picked docs drag along. Still builds
// nothing, so the operator can go back and change their mind at no cost.
export function* askEventDocExportUiPreview(serviceName: string, targets: EventDocDocRef[]): AskResponse<void> {
  yield* askUIEventDocExportSetLoading(true);
  yield* askUIEventDocExportSetError(null);

  const result = yield* askCatch(askEventDocManifestFetch(serviceName, targets), askUIEventDocExportSetLoading(false));

  if (!result.success) {
    yield* askUIEventDocExportSetError('Could not work out what these documents depend on.');
    return;
  }

  yield* askUIEventDocExportSetManifest(result.result);
}
