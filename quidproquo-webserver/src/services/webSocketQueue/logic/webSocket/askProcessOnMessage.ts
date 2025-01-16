import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { AnyWebSocketQueueEventMessageWithCorrelation } from '../../types';
import { askAuthenticateConnection } from './askAuthenticateConnection';
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
  yield* askAuthenticateConnection(connectionId);

  // if (isWebSocketMarkLogCheckedMessage(message)) {
  //   yield* askProcessOnMarkLogChecked(connectionId, message.payload.correlationId, message.payload.checked);

  //   return;
  // }

  // if (isWebSocketRefreshLogMetadataMessage(message)) {
  //   yield* askProcessOnRefreshLogMetadata(message.payload.correlationId);
  // }

  // This should never be hit.
  yield* askThrowError(ErrorTypeEnum.GenericError, `Unabled to process [${(message as any)?.messageType}] WebSocket Queue Message`);
}
