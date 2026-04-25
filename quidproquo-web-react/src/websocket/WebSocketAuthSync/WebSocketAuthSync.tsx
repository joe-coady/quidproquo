import { AuthenticationInfo } from 'quidproquo-core';

import { memo } from 'react';

import { useWebsocketAuthSync, useWebsocketPingPong } from './hooks';
import { WebSocketAuthContext } from './WebSocketAuthContext';

export type WebSocketAuthSyncProps = {
  children: React.ReactNode;
  accessToken: AuthenticationInfo['accessToken'];
};

const component: React.FC<WebSocketAuthSyncProps> = ({ children, accessToken }) => {
  const isAuthenticated = useWebsocketAuthSync(accessToken);

  // Keep the active websocket alive
  useWebsocketPingPong();

  return (
    <WebSocketAuthContext.Provider value={isAuthenticated}>
      {children}
    </WebSocketAuthContext.Provider>
  );
};

export const WebSocketAuthSync = memo(component);
