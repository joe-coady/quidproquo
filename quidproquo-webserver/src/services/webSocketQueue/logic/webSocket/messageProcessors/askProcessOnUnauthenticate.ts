import { AskResponse } from 'quidproquo-core';

import { webSocketConnectionData } from '../../../data';
import {
  AnyWebSocketQueueEventMessageWithCorrelation,
  WebSocketQueueClientEventMessageUnauthenticate,
  WebSocketQueueClientMessageEventType,
  WebSocketQueueServerEventMessageUnauthenticated,
  WebSocketQueueServerMessageEventType,
} from '../../../types';
import { askSendMessage } from '../askSendMessage';

export function isWebSocketUnauthenticateMessage(
  event: AnyWebSocketQueueEventMessageWithCorrelation,
): event is WebSocketQueueClientEventMessageUnauthenticate {
  return event.type === WebSocketQueueClientMessageEventType.Unauthenticate;
}

export function* askProcessOnUnauthenticate(connectionId: string): AskResponse<void> {
  const connection = yield* webSocketConnectionData.askGetById(connectionId);
  if (!connection) {
    return;
  }

  // Remove the userid and access token
  const { userId, accessToken, ...connectionWithNoUserInfo } = connection;

  if (connection) {
    yield* webSocketConnectionData.askUpsert(connectionWithNoUserInfo);
  }

  yield* askSendMessage(connectionId, {
    type: WebSocketQueueServerMessageEventType.Unauthenticated,
  } satisfies WebSocketQueueServerEventMessageUnauthenticated);
}
