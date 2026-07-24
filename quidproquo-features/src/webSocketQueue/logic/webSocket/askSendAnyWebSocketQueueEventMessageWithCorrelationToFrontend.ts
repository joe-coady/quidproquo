import { askCatch, AskResponse } from 'quidproquo-core';
import { askWebsocketSendMessage, WebsocketSendMessageErrorTypeEnum } from 'quidproquo-webserver';

import { askWebsocketReadApiNameOrThrow, askWebsocketReadConnectionInfo } from '../../context';
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

// A send that never throws: the connection store can hold records for sockets that
// died without their onDisconnect firing, and one dead connection must not abort a
// multi-connection send. A Disconnected failure deletes the stale record so the
// store self-heals; any other failure (e.g. Throttled) just drops this message for
// this connection. Returns whether the send succeeded.
function* askSendToConnectionCleaningUpStale(connectionId: string, payload: AnyWebSocketQueueEventMessageWithCorrelation): AskResponse<boolean> {
  const result = yield* askCatch(askSendAnyWebSocketQueueEventMessageWithCorrelationOnWebsocket(connectionId, payload));

  if (result.success) {
    return true;
  }

  if (result.error.errorType === WebsocketSendMessageErrorTypeEnum.Disconnected) {
    yield* webSocketConnectionData.askDeleteByConnectionId(connectionId);
  }

  return false;
}

function* askSendMessageToEveryone(payload: AnyWebSocketQueueEventMessageWithCorrelation) {
  const connections = yield* webSocketConnectionData.askGetAllConnections();

  for (const connection of connections) {
    yield* askSendToConnectionCleaningUpStale(connection.id, payload);
  }
}

function* askSendMessageToUser(userId: string, payload: AnyWebSocketQueueEventMessageWithCorrelation) {
  const connections = yield* webSocketConnectionData.askGetConnectionsByUserId(userId);

  for (const connection of connections) {
    yield* askSendToConnectionCleaningUpStale(connection.id, payload);
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
    const sent = yield* askSendToConnectionCleaningUpStale(connectionId, payloadWithCorrelationId);

    // If we sent the message, or we don't have a direct user to send it to, bail
    if (sent || !userId) {
      return;
    }
  }

  if (userId) {
    yield* askSendMessageToUser(userId, payloadWithCorrelationId);
  } else {
    yield* askSendMessageToEveryone(payloadWithCorrelationId);
  }
}
