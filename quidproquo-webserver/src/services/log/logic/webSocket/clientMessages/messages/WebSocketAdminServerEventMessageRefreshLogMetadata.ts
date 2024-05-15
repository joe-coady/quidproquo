import { EventMessage } from 'quidproquo-core';
import { WebsocketAdminClientMessageEventType } from '../WebsocketAdminClientMessageEventType';

export type WebSocketAdminClientEventPayloadRefreshLogMetadata = {
  correlationId: string;
};

export type WebSocketAdminServerEventMessageRefreshLogMetadata = EventMessage<
  WebSocketAdminClientEventPayloadRefreshLogMetadata,
  WebsocketAdminClientMessageEventType.RefreshLogMetadata
>;
