import { AskResponse, askStorageScopeProvide } from 'quidproquo-core';
import { HTTPEvent } from 'quidproquo-webserver';

import { askTenantResolveOptionalActiveTenant } from './askTenantResolveOptionalActiveTenant';

// The one-call tenant gate for CUSTOM routes (anything not bridged through the
// eventDoc controllers, which get this via askEventDocProvideRequestScope +
// the collection's scopeResolver): resolve the request's optional tenant
// header against the given user directory (membership-checked, Forbidden on
// failure) and run the story under that storage scope. No header = Personal,
// the story runs unscoped.
export function* askTenantProvideRequestScope<T>(event: HTTPEvent, userDirectoryName: string, story: AskResponse<T>): AskResponse<T> {
  const tenantId = yield* askTenantResolveOptionalActiveTenant(event, userDirectoryName);

  if (!tenantId) {
    return yield* story;
  }

  return yield* askStorageScopeProvide(tenantId, story);
}
