import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocParseBody } from '../../../eventDoc/routes';
import { askEventDocTransferProvideRequestScope, askEventDocTransferReadRegistry } from '../../globals';
import { askEventDocTransferExport } from '../../logic';
import { EventDocDocRef } from '../../models';

function* askEventDocTransferExportBundle(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { docs } = yield* askEventDocParseBody<{ docs: EventDocDocRef[] }>(event);
  const registry = yield* askEventDocTransferReadRegistry();

  const result = yield* askEventDocTransferExport(registry, docs ?? []);

  return qpqWebServerUtils.toJsonEventResponse(result);
}

/** POST /transfer/export — stage ONE bundle for `{ docs: [{ service, type, id }, ...] }` and return its download url. */
export function* exportBundle(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  return yield* askEventDocTransferProvideRequestScope(event, askEventDocTransferExportBundle(event));
}
