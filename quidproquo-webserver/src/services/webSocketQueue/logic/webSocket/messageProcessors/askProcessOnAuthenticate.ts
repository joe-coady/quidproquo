import { askCatch, askConfigGetGlobal, AskResponse, askUserDirectorySetAccessToken, DecodedAccessToken } from 'quidproquo-core';

import { getWebSocketQueueGlobalConfigKeyForUserDirectoryName } from '../../../../../config';
import { askWebsocketReadApiNameOrThrow } from '../../../../../context';
import { webSocketConnectionData } from '../../../data';
import {
  AnyWebSocketQueueEventMessageWithCorrelation,
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientMessageEventType,
  WebSocketQueueServerEventMessageAuthenticated,
  WebSocketQueueServerEventMessageUnauthenticated,
  WebSocketQueueServerMessageEventType,
} from '../../../types';
import { askBroadcastUnknownMessage } from '../askBroadcastUnknownMessage';
import { askSendMessage } from '../askSendMessage';

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
      const result = yield* askCatch(askUserDirectorySetAccessToken(userDirectoryName, accessToken));

      if (!result.success) {
        yield* askSendMessage(connectionId, {
          type: WebSocketQueueServerMessageEventType.Unauthenticated,
        } satisfies WebSocketQueueServerEventMessageUnauthenticated);
        return;
      }

      const decodedAccessToken: DecodedAccessToken = result.result;

      yield* webSocketConnectionData.askUpsert({
        ...connection,

        userId: decodedAccessToken.userId,
        accessToken,
      });

      yield* askSendMessage(connectionId, {
        type: WebSocketQueueServerMessageEventType.Authenticated,
      } satisfies WebSocketQueueServerEventMessageAuthenticated);

      // Send a websocket message to the event buss WITHOUT an access token
      const webSocketQueueClientEventMessageAuthenticate: WebSocketQueueClientEventMessageAuthenticate = {
        type: WebSocketQueueClientMessageEventType.Authenticate,
        payload: {},
      };

      yield* askBroadcastUnknownMessage(webSocketQueueClientEventMessageAuthenticate);
    }
  }
}
