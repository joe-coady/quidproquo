import { WebSocketAuthSync } from 'quidproquo-web-react';

import { useAuthAccessToken } from './Auth/hooks';

export type WebSocketAuthProviderProps = {
  children: React.ReactNode;
};

export const WebSocketAuthProvider: React.FC<WebSocketAuthProviderProps> = ({ children }) => {
  const accessToken = useAuthAccessToken();

  return <WebSocketAuthSync accessToken={accessToken}>{children}</WebSocketAuthSync>;
};
