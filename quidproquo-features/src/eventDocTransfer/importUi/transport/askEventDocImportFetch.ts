import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { eventDocTransferEndpoint } from '../../constants';
import { EventDocTransferPlanRow } from '../../models';

// Apply the uploaded bundle (POST /transfer/import) and return what happened per doc. `force`
// additionally overwrites docs the target has edited directly; the server backs their discarded
// events up first.
export function* askEventDocImportFetch(serviceName: string, transferId: string, force = false): AskResponse<EventDocTransferPlanRow[]> {
  const response = yield* askApiRequest<{ transferId: string; force: boolean }, EventDocTransferPlanRow[]>(
    serviceName,
    'POST',
    eventDocTransferEndpoint('import'),
    { body: { transferId, force } },
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Import failed (${response.status})`);
  }

  return response.data;
}
