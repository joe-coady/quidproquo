import { AnyEventMessage } from 'quidproquo-core';

import { WebSocketClientEventMessageUnauthenticate, WebsocketClientMessageEventType } from '../../../../../types';
import { websocketConnectionData } from '../../../data';

export function isWebSocketUnauthenticateMessage(event: AnyEventMessage): event is WebSocketClientEventMessageUnauthenticate {
  return event.type === WebsocketClientMessageEventType.Unauthenticate;
}

export function* askProcessOnUnauthenticate(id: string) {
  // Remove the userid and access token
  const { userId, accessToken, ...connection } = (yield* websocketConnectionData.askGetById(id))!;

  if (connection) {
    yield* websocketConnectionData.askUpsert(connection);
  }
}
