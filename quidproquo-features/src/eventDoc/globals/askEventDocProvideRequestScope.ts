import { askInlineFunctionExecute, AskResponse, askStorageScopeProvide, Nullable } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { askEventDocStoreRead } from '../context/askEventDocStoreRead';

// Establish the request's ambient storage scope from the collection's
// `scopeResolver` inline function (e.g. the tenant feature's resolver: header
// -> membership check -> TENANT# scope, no header -> the caller's PERSONAL#
// scope). No resolver configured, or a null result, runs the story unscoped -
// the tenant resolver never returns null. Must run INSIDE the store context -
// the resolver name is read off the provided store.
export function* askEventDocProvideRequestScope<T>(event: HTTPEvent, story: AskResponse<T>): AskResponse<T> {
  const { scopeResolver } = yield* askEventDocStoreRead();

  if (!scopeResolver) {
    return yield* story;
  }

  const scope = yield* askInlineFunctionExecute<Nullable<string>, { event: HTTPEvent }>(scopeResolver, { event });

  if (!scope) {
    return yield* story;
  }

  return yield* askStorageScopeProvide(scope, story);
}
