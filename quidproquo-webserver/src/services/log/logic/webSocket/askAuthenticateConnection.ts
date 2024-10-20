import { ErrorTypeEnum, askThrowError, askUserDirectorySetAccessToken } from 'quidproquo-core';

import { websocketConnectionData } from '../../data';
import { adminUserDirectoryResourceName } from '../../../../config';

export function* askAuthenticateConnection(id: string) {
  const connection = yield* websocketConnectionData.askGetById(id);

  if (connection?.accessToken) {
    // Set the access token inside the context of this session
    // this lets us read the access token out in spawned events
    // and service functions
    yield* askUserDirectorySetAccessToken(adminUserDirectoryResourceName, connection?.accessToken);
  } else {
    yield* askThrowError(ErrorTypeEnum.Unauthorized, 'Unauthorized Websocket connection');
  }
}
