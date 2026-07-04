import { AuthenticationInfo } from 'quidproquo-core';
import { WebsocketServiceEvent } from 'quidproquo-web';
import {
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientEventMessageUnauthenticate,
  WebSocketQueueClientMessageEventType,
  WebSocketQueueServerEventMessageAuthenticated,
  WebSocketQueueServerEventMessageUnauthenticated,
  WebSocketQueueServerMessageEventType,
} from 'quidproquo-webserver';

import { useEffect, useState } from 'react';

import { useFastCallback } from '../../../hooks';
import { useSubscribeToWebsocket, useSubscribeToWebSocketEvent, useWebsocketApi, useWebsocketSendEvent } from '../../hooks';

export const useWebsocketAuthSync = (accessToken: AuthenticationInfo['accessToken']) => {
  const sendMessage = useWebsocketSendEvent();
  const websocketApi = useWebsocketApi();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateAuthTokens = useFastCallback(() => {
    if (!websocketApi?.isConnected()) {
      return;
    }

    if (accessToken) {
      sendMessage({
        type: WebSocketQueueClientMessageEventType.Authenticate,
        payload: {
          accessToken: accessToken,
        },
      } satisfies WebSocketQueueClientEventMessageAuthenticate);
    } else if (isAuthenticated) {
      sendMessage({
        type: WebSocketQueueClientMessageEventType.Unauthenticate,
      } satisfies WebSocketQueueClientEventMessageUnauthenticate);
    }
  });

  useSubscribeToWebSocketEvent<WebSocketQueueServerEventMessageAuthenticated>(WebSocketQueueServerMessageEventType.Authenticated, () =>
    setIsAuthenticated(true),
  );
  useSubscribeToWebSocketEvent<WebSocketQueueServerEventMessageUnauthenticated>(WebSocketQueueServerMessageEventType.Unauthenticated, () =>
    setIsAuthenticated(false),
  );

  // Sync the tokens in on open
  useSubscribeToWebsocket(WebsocketServiceEvent.OPEN, updateAuthTokens);
  useSubscribeToWebsocket(WebsocketServiceEvent.CLOSE, () => setIsAuthenticated(false));

  // Sync the tokens when they change
  useEffect(updateAuthTokens, [accessToken, websocketApi, isAuthenticated]);

  return isAuthenticated;
};
