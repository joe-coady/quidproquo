import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocResolveUserId } from '../../../eventDoc/globals/askEventDocResolveUserId';
import { askTenantRecordGet } from '../../data/askTenantRecordGet';
import { askTenantValidateMembership } from '../../logic/askTenantValidateMembership';

/** GET {basePath}/{id}: one tenant record (fast path), members only. */
export function* get(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  const userId = yield* askEventDocResolveUserId();

  const isMember = yield* askTenantValidateMembership(userId, params.id);
  if (!isMember) {
    return yield* askThrowError(ErrorTypeEnum.Forbidden, 'User is not a member of the requested tenant.');
  }

  const record = yield* askTenantRecordGet(params.id);
  if (!record) {
    return yield* askThrowError(ErrorTypeEnum.NotFound, `Tenant not found: ${params.id}`);
  }

  return qpqWebServerUtils.toJsonEventResponse(record);
}
