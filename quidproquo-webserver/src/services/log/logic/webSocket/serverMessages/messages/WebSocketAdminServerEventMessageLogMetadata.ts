import { EventMessage, StoryResultMetadata } from 'quidproquo-core';
import { WebsocketAdminServerMessageEventType } from '../WebsocketAdminServerMessageEventType';

export type WebSocketAdminServerEventPayloadLogMetadata = {
  log: StoryResultMetadata;
};

export type WebSocketAdminServerEventMessageLogMetadata = EventMessage<
  WebSocketAdminServerEventPayloadLogMetadata,
  WebsocketAdminServerMessageEventType.LogMetadata
>;
