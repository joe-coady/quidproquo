import { askConfigGetGlobal, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { HTTPEvent, qpqWebServerUtils } from 'quidproquo-webserver';

import { DEFAULT_TENANT_HEADER_NAME, TENANT_HEADER_NAME_GLOBAL } from '../constants/tenantGlobalNames';
import { askTenantResolveOptionalActiveTenant } from './askTenantResolveOptionalActiveTenant';

// The REQUIRED request-time gate: same membership re-check as the optional
// variant, but a missing header is a BadRequest - for routes that make no
// sense without a tenant.
export function* askTenantResolveActiveTenant(event: HTTPEvent): AskResponse<string> {
  const tenantId = yield* askTenantResolveOptionalActiveTenant(event);

  if (!tenantId) {
    const configuredHeaderName = yield* askConfigGetGlobal<string>(TENANT_HEADER_NAME_GLOBAL);
    const headerName = configuredHeaderName || DEFAULT_TENANT_HEADER_NAME;
    return yield* askThrowError(ErrorTypeEnum.BadRequest, `Missing tenant header: ${headerName}`);
  }

  return tenantId;
}
