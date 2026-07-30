import { AskResponse, askStateRead } from 'quidproquo-core';

import { askUIEventDocListSetPageIndex } from '../actionCreators/askUIEventDocListSetPageIndex';
import { askEventDocListLoad } from './askEventDocListLoad';
import type { EventDocListState } from '../types/EventDocListState';

// Walk back one page, re-fetching it from the cursor recorded when it was first visited.
//
// Re-fetching rather than caching the rows is deliberate: a cursor is small and stable, whereas cached rows
// go stale the moment anything is edited, and holding every visited page would rebuild the unbounded
// in-memory list this change exists to remove.
export function* askEventDocListPreviousPage(): AskResponse<void> {
  const state = yield* askStateRead<EventDocListState>();

  if (state.pageIndex === 0) {
    return;
  }

  const previousIndex = state.pageIndex - 1;

  yield* askUIEventDocListSetPageIndex(previousIndex, state.cursors[previousIndex] ?? null);
  yield* askEventDocListLoad(state.serviceName, state.listBasePath || state.basePath);
}
