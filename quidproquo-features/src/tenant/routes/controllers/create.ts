import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocProvideRequestScope } from '../../../eventDoc/globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../../eventDoc/globals/askEventDocProvideStoreFromGlobals';
import { askEventDocResolveActor } from '../../../eventDoc/globals/askEventDocResolveActor';
import { askEventDocParseBody } from '../../../eventDoc/routes/askEventDocParseBody';
import { askTenantCreate } from '../../logic/askTenantCreate';

function* askTenantRouteCreate(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const actor = yield* askEventDocResolveActor();

  const { name } = yield* askEventDocParseBody<{ name: string }>(event);

  const summary = yield* askTenantCreate(name, actor);
  return qpqWebServerUtils.toJsonEventResponse(summary);
}

/**
 * POST {basePath}: create a tenant (body `{ name }`); the caller becomes its first member.
 * Runs under the request's scope like any other scoped route, so the new tenant doc lands
 * in the caller's current partition - their personal scope, or the active tenant when an
 * org creates a sub-tenant - and stays manageable from that scope.
 */
export function* create(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askTenantRouteCreate(event)));
}
