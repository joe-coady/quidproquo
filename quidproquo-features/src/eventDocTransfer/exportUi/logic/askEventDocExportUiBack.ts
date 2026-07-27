import { AskResponse } from 'quidproquo-core';

import { askUIEventDocExportSetManifest } from '../actionCreators/askUIEventDocExportSetManifest';

// Back to picking. An empty manifest IS the picking phase (a real manifest always holds at least the
// picked docs), so dropping it is the whole operation - the ticks are untouched.
export function* askEventDocExportUiBack(): AskResponse<void> {
  yield* askUIEventDocExportSetManifest([]);
}
