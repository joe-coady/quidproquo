import { AskResponse } from 'quidproquo-core';

import { askEventDocStoreProvide } from './askEventDocStoreProvide';
import { buildEventDocStore, EventDocStoreOptions } from './buildEventDocStore';

// Provide the EventDoc store context for a collection identified by storeName + type, so a
// CUSTOM route — one outside `defineEventDocRoutes`, which has no per-route globals — can
// call the generic `askEventDocEvent*` / `askEventDocGetByIdOrThrow` data functions. The
// hand-written counterpart to `askEventDocProvideStoreFromGlobals`.
export function* askEventDocProvideStore<T>(
  options: EventDocStoreOptions,
  story: AskResponse<T>
): AskResponse<T> {
  return yield* askEventDocStoreProvide(buildEventDocStore(options), story);
}
