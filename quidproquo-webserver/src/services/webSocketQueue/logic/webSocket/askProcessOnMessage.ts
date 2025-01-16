import { AskResponse } from 'quidproquo-core';

import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../types';
import { askBroadcastUnknownMessage } from './askBroadcastUnknownMessage';
import { askTryAuthenticateConnection } from './askTryAuthenticateConnection';
import {
  askProcessOnAuthenticate,
  askProcessOnPing,
  askProcessOnUnauthenticate,
  isWebSocketAuthenticateMessage,
  isWebSocketPingMessage,
  isWebSocketUnauthenticateMessage,
} from './messageProcessors';

export function* askProcessOnMessage(connectionId: string, message: AnyWebSocketQueueEventMessageWithCorrelation): AskResponse<void> {
  if (isWebSocketAuthenticateMessage(message)) {
    if (message.payload.accessToken) {
      yield* askProcessOnAuthenticate(connectionId, message.payload.accessToken);
    } else {
      yield* askProcessOnUnauthenticate(connectionId);
    }

    return;
  }

  if (isWebSocketUnauthenticateMessage(message)) {
    yield* askProcessOnUnauthenticate(connectionId);

    return;
  }

  if (isWebSocketPingMessage(message)) {
    yield* askProcessOnPing(connectionId);

    return;
  }

  // Make sure any messages below have access to the authenticated user
  yield* askTryAuthenticateConnection(connectionId);

  // Send the message to the event bus
  yield* askBroadcastUnknownMessage(message);
}
