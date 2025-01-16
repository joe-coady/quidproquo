import { WebSocketQueueClientEventMessagePing, WebSocketQueueClientMessageEventType } from 'quidproquo-webserver';

import { useRunEvery } from '../../../hooks';
import { useWebsocketSendEvent } from '../../hooks';

export const useWebsocketPingPong = () => {
  const sendMessage = useWebsocketSendEvent();

  useRunEvery(() => {
    const pingEvent: WebSocketQueueClientEventMessagePing = {
      type: WebSocketQueueClientMessageEventType.Ping,
    };

    sendMessage(pingEvent);
  }, 8 * 60);
};
