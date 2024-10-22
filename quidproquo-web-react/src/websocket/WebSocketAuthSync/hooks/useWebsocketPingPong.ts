import { useEffect } from 'react';

import { useWebsocketSendEvent } from '../../hooks';

import { WebSocketClientEventMessagePing, WebsocketClientMessageEventType } from 'quidproquo-webserver';

export const useWebsocketPingPong = () => {
  const sendMessage = useWebsocketSendEvent();

  useEffect(() => {
    const intervalId = setInterval(
      () => {
        const pingEvent: WebSocketClientEventMessagePing = {
          type: WebsocketClientMessageEventType.Ping,
        };

        sendMessage(pingEvent);
      },
      8 * 60 * 1000, // Every 8 minutes
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [sendMessage]);
};
