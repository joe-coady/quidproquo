import { AskResponse } from 'quidproquo-core';
import { HTTPEvent, HTTPEventResponse, qpqWebServerUtils } from 'quidproquo-webserver';

import { askEventDocParseBody } from '../../../eventDoc/routes';
import { askEventDocTransferProvideRequestScope, askEventDocTransferReadRegistry } from '../../globals';
import { askEventDocBundleApply, askEventDocTransferReadBundle } from '../../logic';

function* askEventDocTransferImport(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  const { transferId, force } = yield* askEventDocParseBody<{ transferId: string; force?: boolean }>(event);
  const registry = yield* askEventDocTransferReadRegistry();

  const bundle = yield* askEventDocTransferReadBundle(transferId);
  const rows = yield* askEventDocBundleApply(registry, bundle, { transferId, force });

  return qpqWebServerUtils.toJsonEventResponse(rows);
}

/**
 * POST /transfer/import — apply the uploaded bundle and report what happened per doc.
 *
 * `force` opts into overwriting docs the target has edited directly: their divergent tail is backed
 * up to the transfer drive and discarded. Off unless the caller asks for it explicitly.
 */
export function* importBundle(event: HTTPEvent): AskResponse<HTTPEventResponse> {
  return yield* askEventDocTransferProvideRequestScope(event, askEventDocTransferImport(event));
}
