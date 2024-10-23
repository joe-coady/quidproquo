import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

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

// Function Types
export type WebsocketSendMessageActionProcessor<T> = ActionProcessor<WebsocketSendMessageAction<T>, void>;
export type WebsocketSendMessageActionRequester<T> = ActionRequester<WebsocketSendMessageAction<T>, void>;
