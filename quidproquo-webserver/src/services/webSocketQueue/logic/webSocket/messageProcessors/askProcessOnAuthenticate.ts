import { AskResponse, askUserDirectorySetAccessToken } from 'quidproquo-core';

import { adminUserDirectoryResourceName } from '../../../../../config';
import { webSocketConnectionData } from '../../../data';
import {
  AnyWebSocketQueueEventMessageWithCorrelation,
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientMessageEventType,
} from '../../../types';

export function isWebSocketAuthenticateMessage(
  event: AnyWebSocketQueueEventMessageWithCorrelation,
): event is WebSocketQueueClientEventMessageAuthenticate {
  return event.type === WebSocketQueueClientMessageEventType.Authenticate;
}

export function* askProcessOnAuthenticate(connectionId: string, accessToken: string): AskResponse<void> {
  const connection = yield* webSocketConnectionData.askGetById(connectionId);

  if (connection) {
    const decodedAccessToken = yield* askUserDirectorySetAccessToken(adminUserDirectoryResourceName, accessToken);

    yield* webSocketConnectionData.askUpsert({
      ...connection,

      userId: decodedAccessToken.userId,
      accessToken,
    });
  }
}
