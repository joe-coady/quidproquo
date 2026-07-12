import { AuthenticationInfo } from 'quidproquo-core';

import { WebSocketQueueEvent } from '../WebSocketQueueEvent';
import { WebSocketQueueEventMessage } from '../WebSocketQueueEventMessage';
import { WebSocketQueueClientMessageEventType } from './WebSocketQueueClientMessageEventType';

export type WebSocketQueueClientEventPayloadAuthenticate = {
  accessToken?: AuthenticationInfo['accessToken'];

  // The connection's claimed storage scope (e.g. an active tenant id). Only
  // stored when the configured connectionScopeValidator confirms the claim;
  // re-authenticating without it clears any previous claim.
  tenantId?: string;
};

export type WebSocketQueueClientEventMessageAuthenticate = WebSocketQueueEventMessage<
  WebSocketQueueClientEventPayloadAuthenticate,
  WebSocketQueueClientMessageEventType.Authenticate
>;

export type WebSocketQueueAuthenticateQueueEvent = WebSocketQueueEvent<
  WebSocketQueueClientMessageEventType.Authenticate,
  WebSocketQueueClientEventPayloadAuthenticate
>;
