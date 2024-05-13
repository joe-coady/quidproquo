import { AnyEventMessage } from 'quidproquo-core';
import {
  WebSocketClientEventMessagePing,
  WebSocketServerEventMessagePong,
  WebsocketClientMessageEventType,
  WebsocketServerMessageEventType,
} from '../../../../../types';
import { askSendMessage } from '../askSendMessage';

export function isWebSocketPingMessage(
  event: AnyEventMessage,
): event is WebSocketClientEventMessagePing {
  return event.type === WebsocketClientMessageEventType.Ping;
}

export function* askProcessOnPing(id: string) {
  const pongMessage: WebSocketServerEventMessagePong = {
    type: WebsocketServerMessageEventType.Pong,
  };

  yield* askSendMessage(id, pongMessage);
}
