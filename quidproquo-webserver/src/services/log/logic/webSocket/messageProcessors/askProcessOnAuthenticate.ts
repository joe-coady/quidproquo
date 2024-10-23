import { AnyEventMessage, askUserDirectorySetAccessToken } from 'quidproquo-core';

import { adminUserDirectoryResourceName } from '../../../../../config';
import { WebSocketClientEventMessageAuthenticate, WebsocketClientMessageEventType } from '../../../../../types';
import { websocketConnectionData } from '../../../data';

export function isWebSocketAuthenticateMessage(event: AnyEventMessage): event is WebSocketClientEventMessageAuthenticate {
  return event.type === WebsocketClientMessageEventType.Authenticate;
}

export function* askProcessOnAuthenticate(id: string, accessToken: string) {
  const connection = yield* websocketConnectionData.askGetById(id);

  if (connection) {
    const decodedAccessToken = yield* askUserDirectorySetAccessToken(adminUserDirectoryResourceName, accessToken);

    yield* websocketConnectionData.askUpsert({
      ...connection,

      userId: decodedAccessToken.userId,
      accessToken,
    });
  }
}
