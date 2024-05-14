import { useWebsocketApi } from './useWebsocketApi';
import { AnyEventMessage } from 'quidproquo-core';
import { useFastCallback } from '../../hooks';

export const useWebsocketSendEvent = () => {
  const websocketApi = useWebsocketApi();

  const sendMessage = useFastCallback((event: AnyEventMessage) => {
    if (websocketApi) {
      websocketApi.sendEvent(event);
    }
  });

  return sendMessage;
};
