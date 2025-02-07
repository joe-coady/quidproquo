import { AskResponse } from 'quidproquo-core';

import { askWebsocketSendMessage } from '../../../../actions';
import { askWebsocketReadApiNameOrThrow } from '../../../../context';
import { AnyWebSocketQueueEventMessage } from '../../types/AnyWebSocketQueueEventMessage';

export function* askSendMessage<E extends AnyWebSocketQueueEventMessage>(connectionId: string, payload: E): AskResponse<void> {
  const apiName = yield* askWebsocketReadApiNameOrThrow();

  yield* askWebsocketSendMessage(apiName, connectionId, payload);
}
