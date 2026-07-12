import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askActiveTenantRead } from './askActiveTenantRead';

// Throw if unprovided: tenant-scoped storage access without an active tenant
// must never silently fall through to unscoped data.
export function* askActiveTenantReadOrThrow(): AskResponse<string> {
  const tenantId = yield* askActiveTenantRead();

  if (!tenantId) {
    return yield* askThrowError(
      ErrorTypeEnum.Forbidden,
      'No active tenant was provided. Wrap the call in askActiveTenantProvide(tenantId, ...) or resolve it from the request.',
    );
  }

  return tenantId;
}
