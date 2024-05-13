import { AnyEventMessage, AskResponse } from 'quidproquo-core';
import { WebsocketEvent } from '../../../../types';

import { askWebsocketProvideConnectionInfo } from '../../../../context';
import { webSocketLogic } from '../../logic';

export function* onConnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
    },
    webSocketLogic.askProcessOnConnect(
      event.connectionId,
      event.requestTime,
      event.requestTimeEpoch,
      event.sourceIp,
    ),
  );
}

export function* onDisconnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
    },
    webSocketLogic.askProcessOnDisconnect(event.connectionId),
  );
}

export function* onMessage(event: WebsocketEvent): AskResponse<void> {
  if (typeof event.body !== 'string') {
    return;
  }

  const message = JSON.parse(event.body) as AnyEventMessage;

  yield* askWebsocketProvideConnectionInfo(
    {
      connectionId: event.connectionId,
      // correlationId: message.correlationId,
    },
    webSocketLogic.askProcessOnMessage(event.connectionId, message),
  );
}
