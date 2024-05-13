import { useCallback, useEffect } from 'react';
import { AuthenticationInfo } from 'quidproquo';
import { WebsocketServiceEvent } from 'quidproquo-web';
import {
  WebSocketClientEventMessageAuthenticate,
  WebSocketClientEventMessageUnauthenticate,
  WebsocketClientMessageEventType,
} from 'quidproquo-webserver';

import { useSubscribeToWebsocket, useWebsocketApi, useWebsocketSendEvent } from '../../hooks';

export const useWebsocketAuthSync = (accessToken: AuthenticationInfo['accessToken']) => {
  const sendMessage = useWebsocketSendEvent();
  const websocketApi = useWebsocketApi();

  const updateAuthTokens = useCallback(() => {
    if (!websocketApi?.isConnected()) {
      return;
    }

    if (accessToken) {
      const authMessage: WebSocketClientEventMessageAuthenticate = {
        type: WebsocketClientMessageEventType.Authenticate,
        payload: {
          accessToken: accessToken,
        },
      };

      sendMessage(authMessage);
    } else {
      const authMessage: WebSocketClientEventMessageUnauthenticate = {
        type: WebsocketClientMessageEventType.Unauthenticate,
      };

      sendMessage(authMessage);
    }
  }, [sendMessage, accessToken, websocketApi, websocketApi?.isConnected()]);

  // Sync the tokens in on open
  useSubscribeToWebsocket(WebsocketServiceEvent.OPEN, updateAuthTokens);

  // Sync the tokens when they change
  useEffect(updateAuthTokens, [updateAuthTokens]);
};
