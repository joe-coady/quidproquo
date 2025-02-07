import { askConfigGetGlobal, AskResponse, askUserDirectorySetAccessToken, DecodedAccessToken } from 'quidproquo-core';

import { getWebSocketQueueGlobalConfigKeyForUserDirectoryName } from '../../../../../config';
import { askWebsocketReadApiNameOrThrow } from '../../../../../context';
import { webSocketConnectionData } from '../../../data';
import {
  AnyWebSocketQueueEventMessageWithCorrelation,
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientMessageEventType,
} from '../../../types';
import { askBroadcastUnknownMessage } from '../askBroadcastUnknownMessage';

export function isWebSocketAuthenticateMessage(
  event: AnyWebSocketQueueEventMessageWithCorrelation,
): event is WebSocketQueueClientEventMessageAuthenticate {
  return event.type === WebSocketQueueClientMessageEventType.Authenticate;
}

export function* askProcessOnAuthenticate(connectionId: string, accessToken: string): AskResponse<void> {
  const connection = yield* webSocketConnectionData.askGetById(connectionId);

  if (connection) {
    const apiName = yield* askWebsocketReadApiNameOrThrow();
    const userDirectoryName = yield* askConfigGetGlobal<string>(getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName));

    if (userDirectoryName) {
      const decodedAccessToken: DecodedAccessToken = yield* askUserDirectorySetAccessToken(userDirectoryName, accessToken);

      yield* webSocketConnectionData.askUpsert({
        ...connection,

        userId: decodedAccessToken.userId,
        accessToken,
      });

      // Send a websocket message to the event buss WITHOUT an access token
      const webSocketQueueClientEventMessageAuthenticate: WebSocketQueueClientEventMessageAuthenticate = {
        type: WebSocketQueueClientMessageEventType.Authenticate,
        payload: {},
      };

      yield* askBroadcastUnknownMessage(webSocketQueueClientEventMessageAuthenticate);
    }
  }
}
