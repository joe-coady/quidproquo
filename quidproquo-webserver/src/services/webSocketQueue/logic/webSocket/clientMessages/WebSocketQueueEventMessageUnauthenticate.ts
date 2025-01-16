import { WebSocketQueueEventMessage } from '../../../types';
import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

export type WebSocketQueueEventPayloadUnauthenticate = undefined;

export type WebSocketQueueEventMessageUnauthenticate = WebSocketQueueEventMessage<
  WebSocketQueueEventPayloadUnauthenticate,
  WebSocketQueueClientMessageEventType.Unauthenticate
>;
