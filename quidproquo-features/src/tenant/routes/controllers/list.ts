import { AskResponse } from 'quidproquo-core';
import { HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocProvideStoreFromGlobals } from '../../../eventDoc/globals/askEventDocProvideStoreFromGlobals';
import { askEventDocResolveUserId } from '../../../eventDoc/globals/askEventDocResolveUserId';
import { askTenantListForUser } from '../../logic/askTenantListForUser';

function* askTenantRouteList(): AskResponse<HTTPEventResponse> {
  const userId = yield* askEventDocResolveUserId();
  const summaries = yield* askTenantListForUser(userId);
  return qpqWebServerUtils.toJsonEventResponse(summaries);
}

/** GET {basePath} — the authenticated user's tenants as EventDocSummary rows (drafts included). */
export function* list(): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askTenantRouteList());
}
