import { EventMessage } from 'quidproquo-core';

import { WebsocketClientMessageEventType } from '../WebsocketClientMessageEventType';

export type WebSocketClientEventPayloadMarkLogChecked = {
  correlationId: string;
  checked: boolean;
};

export type WebSocketClientEventMessageMarkLogChecked = EventMessage<
  WebSocketClientEventPayloadMarkLogChecked,
  WebsocketClientMessageEventType.MarkLogChecked
>;
