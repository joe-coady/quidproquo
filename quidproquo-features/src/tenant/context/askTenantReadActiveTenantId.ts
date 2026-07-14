import { AskResponse } from 'quidproquo-core';

import { getTenantIdFromScope } from '../logic/storageScope';
import { askActiveTenantRead } from './askActiveTenantRead';

// The tenant-IDENTITY reader: null when the ambient scope is unset or a
// personal partition. Use this instead of askActiveTenantRead wherever the
// value will be treated as a tenant id (registry lookups, branding, record
// syncs), so a PERSONAL#<userId> scope is never mistaken for a tenant.
export function* askTenantReadActiveTenantId(): AskResponse<string | null> {
  const scope = yield* askActiveTenantRead();

  if (!scope) {
    return null;
  }

  return getTenantIdFromScope(scope);
}
