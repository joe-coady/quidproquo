import { WebSocketQueueEventMessage } from '../../../types';
import { WebSocketQueueServerMessageEventType } from './WebSocketQueueServerMessageEventType';

export type WebSocketQueueServerEventPayloadPong = undefined;

export type WebSocketQueueServerEventMessagePong = WebSocketQueueEventMessage<
  WebSocketQueueServerEventPayloadPong,
  WebSocketQueueServerMessageEventType.Pong
>;
