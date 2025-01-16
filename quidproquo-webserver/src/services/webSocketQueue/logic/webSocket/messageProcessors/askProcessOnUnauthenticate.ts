import { AnyEventMessage, AskResponse } from 'quidproquo-core';

import { webSocketConnectionData } from '../../../data';
import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../../types';
import { WebSocketQueueClientMessageEventType, WebSocketQueueEventMessageUnauthenticate } from '../clientMessages';

export function isWebSocketUnauthenticateMessage(
  event: AnyWebSocketQueueEventMessageWithCorrelation,
): event is WebSocketQueueEventMessageUnauthenticate {
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
}
