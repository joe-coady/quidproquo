import { askConfigGetGlobal, askInlineFunctionExecute, AskResponse, askStorageScopeProvide, Nullable } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { EVENT_DOC_TRANSFER_SCOPE_RESOLVER_GLOBAL } from '../constants';

/**
 * Establish the request's ambient storage scope for a transfer, from the registered scope resolver
 * (e.g. the tenant feature's: header -> membership check -> TENANT# scope).
 *
 * Deliberately its own resolver rather than eventDoc's askEventDocProvideRequestScope: that one
 * reads the resolver name off a PROVIDED store, and a transfer spans many collections, so there is
 * no single store to read it from. Scoping once here means every collection the transfer touches
 * reads and writes inside the same tenant partition.
 */
export function* askEventDocTransferProvideRequestScope<T>(event: HTTPEvent, story: AskResponse<T>): AskResponse<T> {
  const scopeResolver = yield* askConfigGetGlobal<string>(EVENT_DOC_TRANSFER_SCOPE_RESOLVER_GLOBAL);

  if (!scopeResolver) {
    return yield* story;
  }

  const scope = yield* askInlineFunctionExecute<Nullable<string>, { event: HTTPEvent }>(scopeResolver, { event });

  if (!scope) {
    return yield* story;
  }

  return yield* askStorageScopeProvide(scope, story);
}
