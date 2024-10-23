import { createErrorEnumForAction } from 'quidproquo-core';

import { WebsocketActionType } from './WebsocketActionType';
import { WebsocketSendMessageActionRequester } from './WebsocketSendMessageActionTypes';

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
