import { useCallback, useEffect } from 'react';
import { AuthenticationInfo } from 'quidproquo';
import { WebsocketServiceEvent } from 'quidproquo-web';
import {
  WebSocketClientEventMessageAuthenticate,
  WebSocketClientEventMessageUnauthenticate,
  WebsocketClientMessageEventType,
} from 'quidproquo-webserver';

import { useSubscribeToWebsocket, useWebsocketApi, useWebsocketSendEvent } from '../../hooks';

export const useWebsocketAuthSync = (tokens: AuthenticationInfo) => {
  const sendMessage = useWebsocketSendEvent();
  const websocketApi = useWebsocketApi();

  const updateAuthTokens = useCallback(() => {
    if (!websocketApi?.isConnected()) {
      return;
    }

    if (tokens?.accessToken) {
      const authMessage: WebSocketClientEventMessageAuthenticate = {
        type: WebsocketClientMessageEventType.Authenticate,
        payload: {
          accessToken: tokens.accessToken,
        },
      };

      sendMessage(authMessage);
    } else {
      const authMessage: WebSocketClientEventMessageUnauthenticate = {
        type: WebsocketClientMessageEventType.Unauthenticate,
      };

      sendMessage(authMessage);
    }
  }, [sendMessage, tokens?.accessToken, websocketApi]);

  // Sync the tokens in on open
  useSubscribeToWebsocket(WebsocketServiceEvent.OPEN, updateAuthTokens);

  // Sync the tokens when they change
  useEffect(updateAuthTokens, [updateAuthTokens]);
};
