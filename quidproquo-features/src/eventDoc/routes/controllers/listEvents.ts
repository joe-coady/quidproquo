import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocEventList } from '../../data/askEventDocEventList';
import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';

function* askEventDocStoreListEvents(event: HTTPEvent, modelId: string): AskResponse<HTTPEventResponse> {
  const limit = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'limit');
  const nextPageKey = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'nextPageKey');
  const afterIndex = qpqWebServerUtils.readUriQueryParamFromEvent(event, 'afterIndex');

  const page = yield* askEventDocEventList(modelId, {
    limit: limit ? Number(limit) : undefined,
    nextPageKey,
    afterIndex: afterIndex ? Number(afterIndex) : undefined,
  });

  return qpqWebServerUtils.toJsonEventResponse(page);
}

export function* listEvents(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreListEvents(event, params.id)));
}
