import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocSummary } from '../../models';
import { eventDocListCollectionEndpoint } from './eventDocListCollectionEndpoint';

// Fetches every summary in a collection (the generic GET {basePath} route).
export function* askEventDocListFetch(serviceName: string, basePath: string): AskResponse<EventDocSummary[]> {
  const response = yield* askApiRequest<void, EventDocSummary[]>(serviceName, 'GET', eventDocListCollectionEndpoint(basePath));

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to list ${basePath} (${response.status})`);
  }

  return response.data;
}
