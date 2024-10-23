import { AuthenticationInfo } from 'quidproquo-core';

import { memo } from 'react';

import { useWebsocketAuthSync, useWebsocketPingPong } from './hooks';

export type WebSocketAuthSyncProps = {
  children: React.ReactNode;
  accessToken: AuthenticationInfo['accessToken'];
};

const component: React.FC<WebSocketAuthSyncProps> = ({ children, accessToken }) => {
  useWebsocketAuthSync(accessToken);

  // Keep the active websocket alive
  useWebsocketPingPong();

  // This fragment is not useless!
  return <>{children}</>;
};

export const WebSocketAuthSync = memo(component);
