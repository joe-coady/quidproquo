import { WebsocketService } from 'quidproquo-web';
import { useEffect, useRef } from 'react';

export const useWebsocketManagement = (wsUrl: string) => {
  // We may need to support the URL changing at some point
  const websocketApiRef = useRef<WebsocketService>(new WebsocketService(wsUrl));

  useEffect(
    () => () => {
      websocketApiRef.current.destroy();
    },
    [],
  );

  return websocketApiRef.current;
};
