import { AskResponse } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { askActiveTenantProvide } from '../context/askActiveTenantProvide';
import { askTenantResolveActiveTenant } from '../logic/askTenantResolveActiveTenant';

// The single wiring point for tenant-scoped controllers: resolve + validate the
// tenant from the request, then run the inner story with it as ambient context
// so nested logic can use the askTenant* wrappers without threading an id.
export function* askTenantProvideActiveTenantFromRequest<T>(event: HTTPEvent, story: AskResponse<T>): AskResponse<T> {
  const tenantId = yield* askTenantResolveActiveTenant(event);
  return yield* askActiveTenantProvide(tenantId, story);
}
