import { AuthenticationInfo, EventMessage } from 'quidproquo-core';
import { WebsocketClientMessageEventType } from '../WebsocketClientMessageEventType';

export type WebSocketClientEventPayloadAuthenticate = {
  accessToken?: AuthenticationInfo['accessToken'];
};

export type WebSocketClientEventMessageAuthenticate = EventMessage<
  WebSocketClientEventPayloadAuthenticate,
  WebsocketClientMessageEventType.Authenticate
>;
