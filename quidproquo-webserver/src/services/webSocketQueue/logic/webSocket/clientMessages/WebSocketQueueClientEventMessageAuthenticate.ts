import { AuthenticationInfo, EventMessage } from 'quidproquo-core';

import { WebSocketQueueEventMessage } from '../../../types';
import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

export type WebSocketQueueClientEventPayloadAuthenticate = {
  accessToken?: AuthenticationInfo['accessToken'];
};

export type WebSocketQueueClientEventMessageAuthenticate = WebSocketQueueEventMessage<
  WebSocketQueueClientEventPayloadAuthenticate,
  WebSocketQueueClientMessageEventType.Authenticate
>;
