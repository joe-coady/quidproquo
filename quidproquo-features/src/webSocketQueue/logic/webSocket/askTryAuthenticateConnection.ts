import { askConfigGetGlobal, AskResponse, askUserDirectorySetAccessToken, Nullable } from 'quidproquo-core';

import { getWebSocketQueueGlobalConfigKeyForUserDirectoryName } from '../../config/defineWebSocketQueue';
import { askWebsocketReadApiNameOrThrow } from '../../context';
import { webSocketConnectionData } from '../../data';
import { Connection } from '../../types';

// Re-stamp the connection's auth onto this message's session, and hand the
// connection record back so the caller can also apply its stored storage scope.
export function* askTryAuthenticateConnection(connectionId: string): AskResponse<Nullable<Connection>> {
  const apiName = yield* askWebsocketReadApiNameOrThrow();
  const userDirectoryName = yield* askConfigGetGlobal<string>(getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName));
  if (!userDirectoryName) {
    return null;
  }

  const connection = yield* webSocketConnectionData.askGetById(connectionId);
  if (connection?.accessToken) {
    // Set the access token inside the context of this session
    // this lets us read the access token out in spawned events
    // and service functions
    yield* askUserDirectorySetAccessToken(userDirectoryName, connection?.accessToken);
  }

  return connection ?? null;
}
