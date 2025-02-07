import { askConfigGetGlobal, AskResponse, askUserDirectorySetAccessToken } from 'quidproquo-core';

import { getWebSocketQueueGlobalConfigKeyForUserDirectoryName } from '../../../../config';
import { askWebsocketReadApiNameOrThrow } from '../../../../context';
import { webSocketConnectionData } from '../../data';

export function* askTryAuthenticateConnection(connectionId: string): AskResponse<void> {
  const apiName = yield* askWebsocketReadApiNameOrThrow();
  const userDirectoryName = yield* askConfigGetGlobal<string>(getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName));
  if (!userDirectoryName) {
    return;
  }

  const connection = yield* webSocketConnectionData.askGetById(connectionId);
  if (connection?.accessToken) {
    // Set the access token inside the context of this session
    // this lets us read the access token out in spawned events
    // and service functions
    yield* askUserDirectorySetAccessToken(userDirectoryName, connection?.accessToken);
  }
}
