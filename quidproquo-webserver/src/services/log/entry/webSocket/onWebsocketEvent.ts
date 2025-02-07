import { AnyEventMessage, AskResponse } from 'quidproquo-core';

import { askWebsocketProvideConnectionInfo } from '../../../../context';
import { WebsocketEvent } from '../../../../types';
import { webSocketLogic } from '../../logic';

export function* onConnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      apiName: event.apiName,
      connectionId: event.connectionId,
    },
    webSocketLogic.askProcessOnConnect(event.connectionId, event.requestTime, event.requestTimeEpoch, event.sourceIp),
  );
}

export function* onDisconnect(event: WebsocketEvent): AskResponse<void> {
  yield* askWebsocketProvideConnectionInfo(
    {
      apiName: event.apiName,
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
      apiName: event.apiName,
      connectionId: event.connectionId,
      // correlationId: message.correlationId,
    },
    webSocketLogic.askProcessOnMessage(event.connectionId, message),
  );
}
