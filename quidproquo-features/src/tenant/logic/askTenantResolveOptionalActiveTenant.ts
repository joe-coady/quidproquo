import { askCatch, askConfigGetGlobal, AskResponse, askThrowError, askUserDirectoryReadAccessToken, ErrorTypeEnum } from 'quidproquo-core';
import { HTTPEvent, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocResolveUserId } from '../../eventDoc/globals/askEventDocResolveUserId';
import { DEFAULT_TENANT_HEADER_NAME, TENANT_HEADER_NAME_GLOBAL } from '../constants/tenantGlobalNames';
import { askTenantValidateMembership } from './askTenantValidateMembership';

// eventDoc-bridged routes resolve the user off the store's user-directory
// global; custom routes have no such global and pass their directory in.
function* askResolveUserId(userDirectoryName?: string): AskResponse<string> {
  if (!userDirectoryName) {
    return yield* askEventDocResolveUserId();
  }

  const token = yield* askUserDirectoryReadAccessToken(userDirectoryName, false);

  if (!token?.userId) {
    return yield* askThrowError(ErrorTypeEnum.Unauthorized, 'User not authenticated');
  }

  return token.userId;
}

// The optional request-time gate: no tenant header means Personal (null,
// unscoped) rather than an error - the shape every tenant-scopable route uses.
// A PRESENT header is still re-checked against the membership table on EVERY
// request before the id becomes trusted scope. Never trust the header alone.
//
// The header-name global is only set on the tenant feature's own routes, so
// arbitrary routes fall back to the default header name.
export function* askTenantResolveOptionalActiveTenant(event: HTTPEvent, userDirectoryName?: string): AskResponse<string | null> {
  const configuredHeaderName = yield* askCatch(askConfigGetGlobal<string>(TENANT_HEADER_NAME_GLOBAL));
  const headerName = (configuredHeaderName.success && configuredHeaderName.result) || DEFAULT_TENANT_HEADER_NAME;

  const tenantId = qpqWebServerUtils.getHeaderValue(headerName, event.headers);
  if (!tenantId) {
    return null;
  }

  const userId = yield* askResolveUserId(userDirectoryName);

  const isMember = yield* askTenantValidateMembership(userId, tenantId);
  if (!isMember) {
    return yield* askThrowError(ErrorTypeEnum.Forbidden, 'User is not a member of the requested tenant.');
  }

  return tenantId;
}
