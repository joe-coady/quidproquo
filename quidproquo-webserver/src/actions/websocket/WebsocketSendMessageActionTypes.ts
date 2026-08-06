import { Action } from 'quidproquo-core';

import { WebsocketActionType } from './WebsocketActionType';

// Payload
export interface WebsocketSendMessageActionPayload<T> {
  websocketApiName: string;
  connectionId: string;
  payload: T;
}

// Action
export interface WebsocketSendMessageAction<T> extends Action<WebsocketSendMessageActionPayload<T>> {
  type: WebsocketActionType.SendMessage;
  payload: WebsocketSendMessageActionPayload<T>;
}
