import { askConfigGetGlobal, AskResponse } from 'quidproquo-core';

import { askWebsocketSendMessage } from '../../../../actions';
import { AnyWebSocketQueueEventMessage } from '../../types/AnyWebSocketQueueEventMessage';

export function* askSendMessage<E extends AnyWebSocketQueueEventMessage>(connectionId: string, payload: E): AskResponse<void> {
  const apiName = yield* askConfigGetGlobal<string>('qpq-wsq-ws-api-name');

  yield* askWebsocketSendMessage(apiName, connectionId, payload);
}
