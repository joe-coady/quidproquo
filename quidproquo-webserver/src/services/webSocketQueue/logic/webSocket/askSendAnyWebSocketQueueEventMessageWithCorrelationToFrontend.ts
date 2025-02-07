import { askCatch, AskResponse } from 'quidproquo-core';

import { askWebsocketSendMessage } from '../../../../actions';
import { askWebsocketReadApiNameOrThrow, askWebsocketReadConnectionInfo } from '../../../../context';
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
  const apiName = yield* askWebsocketReadApiNameOrThrow();

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
    const response = yield* askCatch(askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(connectionId, payload));

    // If we sent the message, or we don't have a direct user to send it to, bail
    if (response.success || !userId) {
      return;
    }
  }

  if (userId) {
    yield* askSendMessageToUser(userId, payload);
  } else {
    yield* askSendMessageToEveryone(payload);
  }
}
