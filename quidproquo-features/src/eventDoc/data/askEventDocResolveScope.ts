import { AskResponse, askStorageScopeRead } from 'quidproquo-core';

// The ambient storage scope this collection's reads/writes are partitioned by
// (undefined = unscoped). Read at data-fn time - no capture-at-provide staleness
// and no ordering constraint between the store and scope providers.
export function* askEventDocResolveScope(): AskResponse<string | undefined> {
  const scope = yield* askStorageScopeRead();
  return scope ?? undefined;
}
