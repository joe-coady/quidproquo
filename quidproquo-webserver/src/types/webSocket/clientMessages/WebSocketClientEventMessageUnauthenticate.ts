import { EventMessage } from 'quidproquo-core';

import { WebsocketClientMessageEventType } from '../WebsocketClientMessageEventType';

export type WebSocketClientEventPayloadUnauthenticate = undefined;

export type WebSocketClientEventMessageUnauthenticate = EventMessage<
  WebSocketClientEventPayloadUnauthenticate,
  WebsocketClientMessageEventType.Unauthenticate
>;
