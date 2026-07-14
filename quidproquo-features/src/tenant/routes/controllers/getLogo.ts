import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocResolveUserId } from '../../../eventDoc/globals/askEventDocResolveUserId';
import { askTenantLogoDownloadUrl } from '../../data/askTenantLogoDownloadUrl';
import { askTenantRecordGet } from '../../data/askTenantRecordGet';
import { askTenantValidateMembership } from '../../logic/askTenantValidateMembership';
import { composePersonalScope } from '../../logic/storageScope';

/**
 * GET {basePath}/{id}/logo: a presigned URL for the tenant's logo blob, members only.
 * The registry's cross-scope read path: the logo asset lives in the tenant DOC's home
 * partition (an ordinary scoped doc), so the scoped eventDoc asset route can't serve it
 * to members reading from another scope — this route presigns with the scope recorded
 * on the tenant record instead. Legacy records (published before `scope` was recorded)
 * fall back to the creator's personal scope, where pre-upgrade docs were homed.
 */
export function* getLogo(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  const userId = yield* askEventDocResolveUserId();

  const isMember = yield* askTenantValidateMembership(userId, params.id);
  if (!isMember) {
    return yield* askThrowError(ErrorTypeEnum.Forbidden, 'User is not a member of the requested tenant.');
  }

  const record = yield* askTenantRecordGet(params.id);
  if (!record) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `Tenant not found: ${params.id}`);
  }

  if (!record.logo) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `Tenant has no logo: ${params.id}`);
  }

  const scope = record.scope ?? composePersonalScope(record.createdByUserId);
  const result = yield* askTenantLogoDownloadUrl(params.id, record.logo.guid, scope);

  return qpqWebServerUtils.toJsonEventResponse(result);
}
