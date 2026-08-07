import { AskResponse, askStateRead } from 'quidproquo-core';

import { askUIEventDocListSetPageIndex } from '../actionCreators/askUIEventDocListSetPageIndex';
import type { EventDocListState } from '../types/EventDocListState';
import { askEventDocListLoad } from './askEventDocListLoad';

// Walk forward one page.
//
// Gated on `nextPageKey` being present — the store's own answer to "is there more". Never on item count: a
// page can be short of `pageSize` because soft-deleted rows were filtered out after reading, and stopping on
// that would silently hide every page beyond the first short one.
export function* askEventDocListNextPage(): AskResponse<void> {
  const state = yield* askStateRead<EventDocListState>();

  if (!state.nextPageKey) {
    return;
  }

  yield* askUIEventDocListSetPageIndex(state.pageIndex + 1, state.nextPageKey);
  yield* askEventDocListLoad(state.serviceName, state.listBasePath || state.basePath);
}
