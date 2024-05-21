import { WebsocketSendMessageActionRequester } from './WebsocketSendMessageActionTypes';
import { WebsocketActionType } from './WebsocketActionType';
import { createErrorEnumForAction } from 'quidproquo-core';

export const WebsocketSendMessageErrorTypeEnum = createErrorEnumForAction(WebsocketActionType.SendMessage, ['Throttled', 'Disconnected']);

export function* askWebsocketSendMessage<T>(websocketApiName: string, connectionId: string, payload: T): WebsocketSendMessageActionRequester<T> {
  return yield {
    type: WebsocketActionType.SendMessage,
    payload: {
      websocketApiName,
      connectionId,
      payload,
    },
  };
}
