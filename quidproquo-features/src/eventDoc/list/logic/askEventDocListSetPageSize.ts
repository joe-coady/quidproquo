import { AskResponse, askStateRead } from 'quidproquo-core';

import { askUIEventDocListSetPageSize } from '../actionCreators/askUIEventDocListSetPageSize';
import type { EventDocListState } from '../types/EventDocListState';
import { askEventDocListLoad } from './askEventDocListLoad';

// The view-facing page-size change (api.eventDocListSetPageSize), dispatched with the measured
// rows-per-viewport.
//
// It RELOADS, because the reducer restarts the walk: every recorded cursor was produced under the old page
// size, so keeping them would skip or repeat rows. Reloading is what actually refills the (now empty) first
// page — without it a resize would blank the list until something else triggered a fetch.
export function* askEventDocListSetPageSize(pageSize: number): AskResponse<void> {
  const before = yield* askStateRead<EventDocListState>();

  yield* askUIEventDocListSetPageSize(pageSize);

  const after = yield* askStateRead<EventDocListState>();

  if (after.pageSize !== before.pageSize) {
    yield* askEventDocListLoad(after.serviceName, after.listBasePath || after.basePath);
  }
}
