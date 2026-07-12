import { AskResponse } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { askTenantResolveOptionalActiveTenant } from './askTenantResolveOptionalActiveTenant';

// The inline-function implementation behind TENANT_SCOPE_RESOLVER_FN: the
// eventDoc feature's generic `scopeResolver` hook calls this with the request
// so any collection can be tenant-scoped without eventDoc knowing about
// tenants. Null = Personal (unscoped).
export function* askTenantScopeResolver(input: { event: HTTPEvent }): AskResponse<string | null> {
  return yield* askTenantResolveOptionalActiveTenant(input.event);
}
