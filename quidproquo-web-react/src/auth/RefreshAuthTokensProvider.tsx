import { AuthenticationInfo } from 'quidproquo-core';

import { memo } from 'react';

import { useRefreshTokens } from './hooks';

export type RefreshAuthTokensProviderProps = {
  children: React.ReactNode;
  authenticationInfo?: AuthenticationInfo;
  refreshTokens: (authenticationInfo: AuthenticationInfo) => Promise<any>;
};

const RefreshAuthTokensProviderComponent: React.FC<RefreshAuthTokensProviderProps> = ({ children, authenticationInfo, refreshTokens }) => {
  useRefreshTokens(authenticationInfo, refreshTokens);

  // This fragment is not useless!
  return <>{children}</>;
};

export const RefreshAuthTokensProvider = memo(RefreshAuthTokensProviderComponent);
