import { AskResponse } from 'quidproquo-core';

import { askUIEventDocListSetPageSize } from '../actionCreators/askUIEventDocListSetPageSize';

// The view-facing page-size change (api.eventDocListSetPageSize) — dispatched
// with the measured rows-per-viewport; the reducer re-clamps the current page.
export function* askEventDocListSetPageSize(pageSize: number): AskResponse<void> {
  yield* askUIEventDocListSetPageSize(pageSize);
}
