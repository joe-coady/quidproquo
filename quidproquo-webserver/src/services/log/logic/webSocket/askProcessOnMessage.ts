/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnyEventMessage, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import {
  askProcessOnAuthenticate,
  askProcessOnPing,
  askProcessOnUnauthenticate,
  isWebSocketAuthenticateMessage,
  isWebSocketPingMessage,
  isWebSocketUnauthenticateMessage,
} from './messageProcessors';

export function* askProcessOnMessage(
  connectionId: string,
  message: AnyEventMessage,
): AskResponse<void> {
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

  // This should never be hit.
  yield* askThrowError(
    ErrorTypeEnum.GenericError,
    `Unabled to process [${(message as any)?.messageType}] WebSocket message`,
  );
}
