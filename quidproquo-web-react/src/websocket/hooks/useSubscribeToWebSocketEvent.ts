import { useEffect } from 'react';
import { AnyEventMessage, EventMessageTypeConstraint } from 'quidproquo-core';
import { WebSocketServiceEventSubscriptionFunction } from 'quidproquo-web';

import { useWebsocketApi } from './useWebsocketApi';

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
