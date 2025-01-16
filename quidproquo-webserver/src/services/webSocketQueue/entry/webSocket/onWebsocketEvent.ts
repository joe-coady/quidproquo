import { AskResponse } from 'quidproquo-core';

import { askWebsocketProvideConnectionInfo } from '../../../../context';
import { WebsocketEvent } from '../../../../types';
import { webSocketQueueLogic } from '../../logic';
import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../types';

export function* onConnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
    },
    webSocketQueueLogic.askProcessOnConnect(event.connectionId, event.requestTime, event.requestTimeEpoch, event.sourceIp),
  );
}

export function* onDisconnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
    },
    webSocketQueueLogic.askProcessOnDisconnect(event.connectionId),
  );
}

export function* onMessage(event: WebsocketEvent): AskResponse<void> {
  if (typeof event.body !== 'string') {
    return;
  }

  const message = JSON.parse(event.body) as AnyWebSocketQueueEventMessageWithCorrelation;

  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
      correlationId: message.correlationId,
    },
    webSocketQueueLogic.askProcessOnMessage(event.connectionId, message),
  );
}
