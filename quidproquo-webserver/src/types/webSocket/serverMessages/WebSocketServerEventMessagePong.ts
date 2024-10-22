import { EventMessage } from 'quidproquo-core';
import { WebsocketServerMessageEventType } from '../WebsocketServerMessageEventType';

export type WebSocketServerEventPayloadPong = undefined;

export type WebSocketServerEventMessagePong = EventMessage<WebSocketServerEventPayloadPong, WebsocketServerMessageEventType.Pong>;
