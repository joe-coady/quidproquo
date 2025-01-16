import { AskResponse } from 'quidproquo-core';

import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../../types';
import { askSendMessage } from '../askSendMessage';
import { WebSocketQueueClientEventMessagePing, WebSocketQueueClientMessageEventType } from '../clientMessages';
import { WebSocketQueueServerEventMessagePong, WebSocketQueueServerMessageEventType } from '../serverMessages';

export function isWebSocketPingMessage(event: AnyWebSocketQueueEventMessageWithCorrelation): event is WebSocketQueueClientEventMessagePing {
  return event.type === WebSocketQueueClientMessageEventType.Ping;
}

export function* askProcessOnPing(id: string): AskResponse<void> {
  const pongMessage: WebSocketQueueServerEventMessagePong = {
    type: WebSocketQueueServerMessageEventType.Pong,
  };

  yield* askSendMessage(id, pongMessage);
}
