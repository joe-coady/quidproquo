import { useCallback } from 'react';

import { useWebsocketApi } from './useWebsocketApi';
import { AnyEventMessage } from 'quidproquo-core';

export const useWebsocketSendEvent = () => {
  const websocketApi = useWebsocketApi();

  const sendMessage = useCallback(
    (event: AnyEventMessage) => {
      if (websocketApi) {
        websocketApi.sendEvent(event);
      }
    },
    [websocketApi],
  );

  return sendMessage;
};
