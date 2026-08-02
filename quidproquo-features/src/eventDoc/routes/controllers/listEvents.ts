import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocEventList } from '../../data/askEventDocEventList';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { askEventDocEventBootstrapPage } from '../../logic/askEventDocEventBootstrapPage';

function* askEventDocStoreListEvents(event: HTTPEvent, modelId: string): AskResponse<HTTPEventResponse> {
  const limit = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'limit');
  const nextPageKey = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'nextPageKey');
  const afterEventId = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'afterEventId');
  const includeBase = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'includeBase');

  // includeBase asks for the bootstrap shape: the newest snapshot base plus the events
  // after it, with a from-the-start fallback carried in-band as base: null. It replaces
  // afterEventId (the base decides where the page starts); a paging follow-up goes back
  // to the plain shape with afterEventId = base.eventId.
  if (includeBase === 'true') {
    const bootstrapPage = yield* askEventDocEventBootstrapPage(modelId, {
      limit: limit ? Number(limit) : undefined,
      nextPageKey,
    });

    return qpqWebServerUtils.toJsonEventResponse(bootstrapPage);
  }

  const page = yield* askEventDocEventList(modelId, {
    limit: limit ? Number(limit) : undefined,
    nextPageKey,
    afterEventId: afterEventId || undefined,
  });

  return qpqWebServerUtils.toJsonEventResponse(page);
}

export function* listEvents(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreListEvents(event, params.id)));
}
