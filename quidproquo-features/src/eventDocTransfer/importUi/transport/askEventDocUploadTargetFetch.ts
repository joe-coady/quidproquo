import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { eventDocTransferEndpoint } from '../../constants';
import { EventDocTransferUploadTarget } from '../../models';

// Ask for somewhere to put a bundle file (POST /transfer/upload).
export function* askEventDocUploadTargetFetch(serviceName: string): AskResponse<EventDocTransferUploadTarget> {
  const response = yield* askApiRequest<void, EventDocTransferUploadTarget>(serviceName, 'POST', eventDocTransferEndpoint('upload'));

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Could not start an import (${response.status})`);
  }

  return response.data;
}
