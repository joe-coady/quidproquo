import { AskResponse } from 'quidproquo-core';

import { askPlatformRequest } from '../../../platformLogic/network/askPlatformRequest';
import { askUIVolatileServiceNamesLoaded } from '../../actionCreators/volatile/askUIVolatileServiceNamesLoaded';

export function* askLoadServiceNames(): AskResponse<void> {
  const response = yield* askPlatformRequest<undefined, string[]>('GET', '/admin/services');

  if (response.status < 200 || response.status >= 300) {
    return;
  }

  yield* askUIVolatileServiceNamesLoaded(response.data);
}
