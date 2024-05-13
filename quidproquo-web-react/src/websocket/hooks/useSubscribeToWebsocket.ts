import { useEffect } from 'react';

import { useWebsocketApi } from './useWebsocketApi';
import { WebSocketServiceSubscriptionFunction, WebsocketServiceEvent } from 'quidproquo-web';

export const useSubscribeToWebsocket = (
  subscriptionType: WebsocketServiceEvent,
  callback: WebSocketServiceSubscriptionFunction,
) => {
  const websocketService = useWebsocketApi();

  useEffect(() => {
    const handle = websocketService?.subscribe(subscriptionType, callback);

    return () => {
      if (handle) {
        websocketService?.unsubscribe(handle);
      }
    };
  }, [websocketService, subscriptionType, callback]);
};
