import { AskResponse } from 'quidproquo-core';

import { askUIEventDocExportReset } from '../actionCreators/askUIEventDocExportReset';

// Closing the dialog drops the staged download link too: it is short-lived, and a reopen re-walks
// the manifest so the operator never acts on a stale picture.
export function* askEventDocExportUiClose(): AskResponse<void> {
  yield* askUIEventDocExportReset();
}
