import {
  askCatch,
  askConfigGetGlobal,
  askInlineFunctionExecute,
  AskResponse,
  askUserDirectorySetAccessToken,
  DecodedAccessToken,
} from 'quidproquo-core';

import {
  getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator,
  getWebSocketQueueGlobalConfigKeyForUserDirectoryName,
} from '../../../../../config';
import { askWebsocketReadApiNameOrThrow } from '../../../../../context';
import { webSocketConnectionData } from '../../../data';
import {
  AnyWebSocketQueueEventMessageWithCorrelation,
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientMessageEventType,
  WebSocketQueueServerEventMessageAuthenticated,
  WebSocketQueueServerEventMessageUnauthenticated,
  WebSocketQueueServerMessageEventType,
} from '../../../types';
import { askBroadcastUnknownMessage } from '../askBroadcastUnknownMessage';
import { askSendMessage } from '../askSendMessage';
import { askProcessOnUnauthenticate } from './askProcessOnUnauthenticate';

export function isWebSocketAuthenticateMessage(
  event: AnyWebSocketQueueEventMessageWithCorrelation,
): event is WebSocketQueueClientEventMessageAuthenticate {
  return event.type === WebSocketQueueClientMessageEventType.Authenticate;
}

// Validate a claimed storage scope (e.g. a tenant id) via the configured
// connectionScopeValidator inline function. A claim with NO validator
// configured is invalid by definition - an unvalidatable scope must never be
// silently accepted (wrong partition) or silently dropped (data lands in the
// unscoped partition while the client believes it is scoped).
function* askValidateScopeClaim(apiName: string, userId: string, requestedScope: string): AskResponse<boolean> {
  const scopeValidator = yield* askConfigGetGlobal<string>(getWebSocketQueueGlobalConfigKeyForConnectionScopeValidator(apiName));

  if (!scopeValidator) {
    return false;
  }

  const validation = yield* askCatch(
    askInlineFunctionExecute<boolean, { userId: string; requestedScope: string }>(scopeValidator, { userId, requestedScope }),
  );

  return validation.success && validation.result === true;
}

export function* askProcessOnAuthenticate(connectionId: string, accessToken: string, tenantId?: string): AskResponse<void> {
  const connection = yield* webSocketConnectionData.askGetById(connectionId);

  // No connection record (e.g. the connect event hasn't been processed yet) —
  // tell the client rather than dropping the request silently, so it can
  // distinguish "not authenticated" from "no reply".
  if (!connection) {
    yield* askSendMessage(connectionId, {
      type: WebSocketQueueServerMessageEventType.Unauthenticated,
    } satisfies WebSocketQueueServerEventMessageUnauthenticated);
    return;
  }

  const apiName = yield* askWebsocketReadApiNameOrThrow();
  const userDirectoryName = yield* askConfigGetGlobal<string>(getWebSocketQueueGlobalConfigKeyForUserDirectoryName(apiName));

  if (userDirectoryName) {
    const result = yield* askCatch(askUserDirectorySetAccessToken(userDirectoryName, accessToken));

    // A rejected authenticate downgrades the CONNECTION, not just the reply:
    // on a re-authenticate the row still holds the previous userId/accessToken/
    // tenantId, and later messages re-stamp auth from the row, so leaving it
    // untouched would keep the session alive under the old identity and scope
    // while the client believes it is unauthenticated.
    if (!result.success) {
      return yield* askProcessOnUnauthenticate(connectionId);
    }

    const decodedAccessToken: DecodedAccessToken = result.result;

    // A failed scope claim rejects the whole authenticate: the client must
    // never end up authenticated on a different scope than it asked for.
    if (tenantId) {
      const isScopeValid = yield* askValidateScopeClaim(apiName, decodedAccessToken.userId, tenantId);

      if (!isScopeValid) {
        return yield* askProcessOnUnauthenticate(connectionId);
      }
    }

    yield* webSocketConnectionData.askUpsert({
      ...connection,

      userId: decodedAccessToken.userId,
      accessToken,

      // No claim clears any previous one - re-authenticating back to Personal.
      tenantId: tenantId || undefined,
    });

    yield* askSendMessage(connectionId, {
      type: WebSocketQueueServerMessageEventType.Authenticated,
    } satisfies WebSocketQueueServerEventMessageAuthenticated);

    // Send a websocket message to the event buss WITHOUT an access token
    const webSocketQueueClientEventMessageAuthenticate: WebSocketQueueClientEventMessageAuthenticate = {
      type: WebSocketQueueClientMessageEventType.Authenticate,
      payload: {},
    };

    yield* askBroadcastUnknownMessage(webSocketQueueClientEventMessageAuthenticate);
  }
}
