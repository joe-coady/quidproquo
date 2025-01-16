import { AuthenticationInfo } from 'quidproquo-core';
import { WebsocketServiceEvent } from 'quidproquo-web';
import {
  WebSocketQueueClientEventMessageAuthenticate,
  WebSocketQueueClientEventMessageUnauthenticate,
  WebSocketQueueClientMessageEventType,
} from 'quidproquo-webserver';

import { useEffect } from 'react';

import { useFastCallback } from '../../../hooks';
import { useSubscribeToWebsocket, useWebsocketApi, useWebsocketSendEvent } from '../../hooks';

export const useWebsocketAuthSync = (accessToken: AuthenticationInfo['accessToken']) => {
  const sendMessage = useWebsocketSendEvent();
  const websocketApi = useWebsocketApi();

  const updateAuthTokens = useFastCallback(() => {
    if (!websocketApi?.isConnected()) {
      return;
    }

    if (accessToken) {
      const authMessage: WebSocketQueueClientEventMessageAuthenticate = {
        type: WebSocketQueueClientMessageEventType.Authenticate,
        payload: {
          accessToken: accessToken,
        },
      };

      sendMessage(authMessage);
    } else {
      const authMessage: WebSocketQueueClientEventMessageUnauthenticate = {
        type: WebSocketQueueClientMessageEventType.Unauthenticate,
      };

      sendMessage(authMessage);
    }
  });

  // Sync the tokens in on open
  useSubscribeToWebsocket(WebsocketServiceEvent.OPEN, updateAuthTokens);

  // Sync the tokens when they change
  useEffect(updateAuthTokens, [accessToken, websocketApi]);
};
