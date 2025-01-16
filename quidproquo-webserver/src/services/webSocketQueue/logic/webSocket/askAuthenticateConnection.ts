import { askThrowError, askUserDirectorySetAccessToken, ErrorTypeEnum } from 'quidproquo-core';

import { adminUserDirectoryResourceName } from '../../../../config';
import { webSocketConnectionData } from '../../data';

export function* askAuthenticateConnection(connectionId: string) {
  const connection = yield* webSocketConnectionData.askGetById(connectionId);

  if (connection?.accessToken) {
    // Set the access token inside the context of this session
    // this lets us read the access token out in spawned events
    // and service functions
    yield* askUserDirectorySetAccessToken(adminUserDirectoryResourceName, connection?.accessToken);
  } else {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Unauthorized Websocket connection');
  }
}
