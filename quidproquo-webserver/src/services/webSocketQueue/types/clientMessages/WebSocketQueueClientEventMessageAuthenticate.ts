import { AuthenticationInfo } from 'quidproquo-core';

import { WebSocketQueueEvent } from '../WebSocketQueueEvent';
import { WebSocketQueueEventMessage } from '../WebSocketQueueEventMessage';
import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

export type WebSocketQueueClientEventPayloadAuthenticate = {
  accessToken?: AuthenticationInfo['accessToken'];
};

export type WebSocketQueueClientEventMessageAuthenticate = WebSocketQueueEventMessage<
  WebSocketQueueClientEventPayloadAuthenticate,
  WebSocketQueueClientMessageEventType.Authenticate
>;

export type WebSocketQueueAuthenticateQueueEvent = WebSocketQueueEvent<
  WebSocketQueueClientMessageEventType.Authenticate,
  WebSocketQueueClientEventPayloadAuthenticate
>;
