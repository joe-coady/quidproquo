import { askConfigGetGlobal, askEventBusSendMessages, AskResponse, EventBusMessage } from 'quidproquo-core';

import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../types';

export function* askBroadcastUnknownMessage({
  // We want to drop the correlationId
  correlationId,
  ...anyWebSocketQueueEventMessage
}: AnyWebSocketQueueEventMessageWithCorrelation): AskResponse<void> {
  const eventBusName = yield* askConfigGetGlobal<string>('qpq-wsq-eb-name');

  yield* askEventBusSendMessages({
    eventBusName,
    eventBusMessages: [anyWebSocketQueueEventMessage as EventBusMessage<any>],
  });
}
