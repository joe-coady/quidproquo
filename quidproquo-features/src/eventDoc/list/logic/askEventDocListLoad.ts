import { askCatch, AskResponse, askStateRead } from 'quidproquo-core';

import { askUIEventDocListPageLoaded } from '../actionCreators/askUIEventDocListPageLoaded';
import { askUIEventDocListSetError } from '../actionCreators/askUIEventDocListSetError';
import { askUIEventDocListSetLoading } from '../actionCreators/askUIEventDocListSetLoading';
import type { EventDocListState } from '../types/EventDocListState';
import { askEventDocListFetch } from '../transport/askEventDocListFetch';

// Load the page the walk is currently on.
//
// The cursor comes from state (`cursors[pageIndex]`), not from the caller, so every entry point — first
// load, next, previous, refresh — goes through one path and cannot disagree about which page is showing.
export function* askEventDocListLoad(serviceName: string, basePath: string): AskResponse<void> {
  const state = yield* askStateRead<EventDocListState>();

  yield* askUIEventDocListSetLoading(true);
  yield* askUIEventDocListSetError(null);

  const result = yield* askCatch(
    askEventDocListFetch(serviceName, basePath, {
      limit: state.pageSize,
      nextPageKey: state.cursors[state.pageIndex],
    }),
    askUIEventDocListSetLoading(false),
  );

  if (!result.success) {
    yield* askUIEventDocListSetError('Failed to load items.');
    yield* askUIEventDocListSetLoading(false);
    return;
  }

  yield* askUIEventDocListPageLoaded(result.result.items, result.result.nextPageKey ?? null);
  yield* askUIEventDocListSetLoading(false);
}
