import { AskResponse, askStateRead } from 'quidproquo-core';

import type { EventDocListState } from '../types/EventDocListState';
import { askEventDocListLoad } from './askEventDocListLoad';

// Re-fetch the list from the backend using the stored config — the Refresh button binds
// this directly (no args; serviceName/basePath come from state).
export function* askEventDocListRefresh(): AskResponse<void> {
  const { serviceName, basePath, listBasePath } = yield* askStateRead<EventDocListState>();
  yield* askEventDocListLoad(serviceName, listBasePath || basePath);
}
