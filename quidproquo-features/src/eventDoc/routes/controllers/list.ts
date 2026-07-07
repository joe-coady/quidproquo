import { AskResponse } from 'quidproquo-core';
import { HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocList } from '../../data/askEventDocList';
import { askEventDocProvideStoreFromGlobals } from '../../globals/askEventDocProvideStoreFromGlobals';

function* askEventDocStoreList(): AskResponse<HTTPEventResponse> {
  const items = yield* askEventDocList();
  return qpqWebServerUtils.toJsonEventResponse(items);
}

/** GET {basePath} — list the collection (newest first, excludes soft-deleted). */
export function* list(): AskResponse<HTTPEventResponse> {
  return yield* askEventDocProvideStoreFromGlobals(askEventDocStoreList());
}
