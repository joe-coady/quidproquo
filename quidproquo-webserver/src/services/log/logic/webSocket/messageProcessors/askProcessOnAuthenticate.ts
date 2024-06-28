import { AnyEventMessage, askUserDirectoryDecodeAccessToken } from 'quidproquo-core';

import { websocketConnectionData } from '../../../data';
import { adminUserDirectoryResourceName } from '../../../../../config';
import { WebSocketClientEventMessageAuthenticate, WebsocketClientMessageEventType } from '../../../../../types';

export function isWebSocketAuthenticateMessage(event: AnyEventMessage): event is WebSocketClientEventMessageAuthenticate {
  return event.type === WebsocketClientMessageEventType.Authenticate;
}

export function* askProcessOnAuthenticate(id: string, accessToken: string) {
  const connection = yield* websocketConnectionData.askGetById(id);

  if (connection) {
    const decodedAccessToken = yield* askUserDirectoryDecodeAccessToken(adminUserDirectoryResourceName, false, accessToken);

    yield* websocketConnectionData.askUpsert({
      ...connection,

      userId: decodedAccessToken.userId,
      accessToken,
    });

    // yield* askUserDirectorySetAccessToken(accessToken);
  }
}
