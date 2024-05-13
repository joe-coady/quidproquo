import { AnyEventMessage } from 'quidproquo-core';
import { askWebsocketSendMessage } from '../../../../actions';

export function* askSendMessage<E extends AnyEventMessage>(connectionId: string, payload: E) {
  yield* askWebsocketSendMessage('wsadmin', connectionId, payload);
}
