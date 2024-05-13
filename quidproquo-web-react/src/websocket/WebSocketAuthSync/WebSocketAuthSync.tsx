import { memo } from 'react';

import { useWebsocketAuthSync, useWebsocketPingPong } from './hooks';
import { AuthenticationInfo } from 'quidproquo-core';

export type WebSocketAuthSyncProps = {
  children: React.ReactNode;
  tokens: AuthenticationInfo;
};

const WebSocketAuthSync: React.FC<WebSocketAuthSyncProps> = ({ children, tokens }) => {
  useWebsocketAuthSync(tokens);

  // Keep the active websocket alive
  useWebsocketPingPong();

  // This fragment is not useless!
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};

export default memo(WebSocketAuthSync);
