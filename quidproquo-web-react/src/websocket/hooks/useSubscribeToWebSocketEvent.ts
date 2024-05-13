import { useEffect } from 'react';

import { useWebsocketApi } from './useWebsocketApi';
import { AnyEventMessage, EventMessageTypeConstraint } from 'quidproquo-core';
import { WebSocketServiceEventSubscriptionFunction } from 'quidproquo-web';

export const useSubscribeToWebSocketEvent = <E extends AnyEventMessage>(
  subscriptionType: E['type'],
  callback: WebSocketServiceEventSubscriptionFunction<E>,
) => {
  const websocketService = useWebsocketApi();

  useEffect(() => {
    const subscriptionHandle = websocketService?.subscribeToEvent(subscriptionType, callback);

    return () => {
      if (subscriptionHandle) {
        websocketService?.unsubscribe(subscriptionHandle);
      }
    };
  }, [websocketService, subscriptionType, callback]);
};
