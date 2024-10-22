import { AnyEventMessage, askUserDirectorySetAccessToken } from 'quidproquo-core';

import { websocketConnectionData } from '../../../data';
import { adminUserDirectoryResourceName } from '../../../../../config';
import { WebSocketClientEventMessageAuthenticate, WebsocketClientMessageEventType } from '../../../../../types';

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
