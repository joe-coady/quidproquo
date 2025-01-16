import { WebSocketQueueEventMessage } from '../../../types';
import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

export type WebSocketQueueClientEventPayloadPing = undefined;

export type WebSocketQueueClientEventMessagePing = WebSocketQueueEventMessage<
  WebSocketQueueClientEventPayloadPing,
  WebSocketQueueClientMessageEventType.Ping
>;
