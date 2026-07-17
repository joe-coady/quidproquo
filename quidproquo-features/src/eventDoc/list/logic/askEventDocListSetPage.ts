import { AskResponse } from 'quidproquo-core';

import { askUIEventDocListSetPage } from '../actionCreators/askUIEventDocListSetPage';

// The view-facing page change (api.eventDocListSetPage) — the reducer clamps
// the requested page into range against the current item count.
export function* askEventDocListSetPage(page: number): AskResponse<void> {
  yield* askUIEventDocListSetPage(page);
}
