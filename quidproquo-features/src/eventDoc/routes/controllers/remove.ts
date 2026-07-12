import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { askEventDocResolveUserId } from '../../globals/askEventDocResolveUserId';
import { askEventDocSoftDelete } from '../../logic/askEventDocSoftDelete';

function* askEventDocStoreSoftDelete(id: string): AskResponse<HTTPEventResponse> {
  const userId = yield* askEventDocResolveUserId();

  const model = yield* askEventDocSoftDelete(id, userId);
  return qpqWebServerUtils.toJsonEventResponse(model);
}

/** DELETE {basePath}/{id} — soft-delete the model (`delete` is reserved, so the entry is `remove`). */
export function* remove(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreSoftDelete(params.id)));
}
