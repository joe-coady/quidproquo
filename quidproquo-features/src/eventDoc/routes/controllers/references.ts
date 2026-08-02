import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocProvideRequestScope } from '../../globals/askEventDocProvideRequestScope';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';
import { askEventDocReferences } from '../../logic/askEventDocReferences';

function* askEventDocStoreReferences(docId: string): AskResponse<HTTPEventResponse> {
  const links = yield* askEventDocReferences(docId);
  return qpqWebServerUtils.toJsonEventResponse(links);
}

/**
 * GET {basePath}/{id}/references — the docs this one depends on, ONE hop out (empty for a
 * collection with no registered functions object). The recursive manifest is a transfer-feature concern
 * (POST /transfer/manifest), because only that layer knows every collection.
 */
export function* references(event: HTTPEvent, params: { id: string }): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocProvideRequestScope(event, askEventDocStoreReferences(params.id)));
}
