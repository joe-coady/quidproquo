import { EventMessage } from 'quidproquo-core';
import { WebsocketClientMessageEventType } from '../WebsocketClientMessageEventType';

export type WebSocketClientEventPayloadPing = undefined;

export type WebSocketClientEventMessagePing = EventMessage<WebSocketClientEventPayloadPing, WebsocketClientMessageEventType.Ping>;
