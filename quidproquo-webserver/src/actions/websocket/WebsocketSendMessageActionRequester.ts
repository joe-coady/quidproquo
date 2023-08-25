import { WebsocketSendMessageActionRequester } from './WebsocketSendMessageActionTypes';
import { WebsocketActionType } from './WebsocketActionType';

export function* askWebsocketSendMessage<T>(
  websocketApiName: string,
  connectionId: string,
  payload: T,
): WebsocketSendMessageActionRequester<T> {
  return yield {
    type: WebsocketActionType.SendMessage,
    payload: {
      websocketApiName,
      connectionId,
      payload,
    },
  };
}
