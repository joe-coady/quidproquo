import { AskResponse } from 'quidproquo-core';

import { askUIEventDocImportReset } from '../actionCreators/askUIEventDocImportReset';

export function* askEventDocImportUiClear(): AskResponse<void> {
  yield* askUIEventDocImportReset();
}
