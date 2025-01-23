import { AnyWebSocketQueueEventMessageWithCorrelation } from 'quidproquo-webserver';

import { useWebsocketSendEvent } from '../../websocket';

export const useWebsocketQueueSendEvent = <E extends AnyWebSocketQueueEventMessageWithCorrelation>() => {
  const sendMessage = useWebsocketSendEvent<E>();

  return sendMessage;
};
