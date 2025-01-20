import { askConfigGetGlobal, AskResponse } from 'quidproquo-core';

import { askWebsocketSendMessage } from '../../../../actions';
import { askWebsocketReadConnectionInfo } from '../../../../context';
import { webSocketConnectionData } from '../../data';
import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../types';
import { AnyWebSocketQueueEventMessage } from '../../types/AnyWebSocketQueueEventMessage';

export type askSendMessageToFrontendArgs = {
  userId?: string;
  connectionId?: string;
  payload: AnyWebSocketQueueEventMessage;
};

function* askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(
  connectionId: string,
  payload: AnyWebSocketQueueEventMessageWithCorrelation,
): AskResponse<void> {
  const apiName = yield* askConfigGetGlobal<string>('qpq-wsq-ws-api-name');

  yield* askWebsocketSendMessage(apiName, connectionId, payload);
}

function* askSendMessageToEveryone(payload: AnyWebSocketQueueEventMessageWithCorrelation) {
  const connections = yield* webSocketConnectionData.askGetAllConnections();

  for (const connection of connections) {
    yield* askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(connection.id, payload);
  }
}

function* askSendMessageToUser(userId: string, payload: AnyWebSocketQueueEventMessageWithCorrelation) {
  const connections = yield* webSocketConnectionData.askGetConnectionsByUserId(userId);

  for (const connection of connections) {
    yield* askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(connection.id, payload);
  }
}

export function* askSendAnyWebSocketQueueEventMessageWithCorrelationToFrontend(
  payload: AnyWebSocketQueueEventMessageWithCorrelation,
  connectionId?: string,
  userId?: string,
): AskResponse<void> {
  // add the correlation id to the response if we have one.
  const payloadWithCorrelationId = { ...payload };

  if (!payloadWithCorrelationId.correlationId) {
    const { correlationId } = yield* askWebsocketReadConnectionInfo();

    payloadWithCorrelationId.correlationId = correlationId;
  }

  if (connectionId) {
    yield* askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(connectionId, payload);
  } else if (userId) {
    yield* askSendMessageToUser(userId, payload);
  } else {
    yield* askSendMessageToEveryone(payload);
  }
}
