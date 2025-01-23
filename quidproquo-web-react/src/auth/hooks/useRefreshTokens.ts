import { AuthenticationInfo } from 'quidproquo-core';

import { useEffect } from 'react';

export const useRefreshTokens = (
  authenticationInfo: AuthenticationInfo | undefined,
  refreshTokens: (authenticationInfo: AuthenticationInfo) => Promise<any>,
) => {
  const refresh = () => {
    if (authenticationInfo && authenticationInfo.refreshToken && authenticationInfo.expiresAt) {
      const now = new Date().toISOString();
      const timeToExpire = new Date(authenticationInfo.expiresAt).getTime() - new Date(now).getTime();

      // Refresh the token 10 minutes before it expires to ensure there's a buffer
      const bufferTime = 10 * 60 * 1000;
      const refreshTime = timeToExpire - bufferTime;

      if (refreshTime > 0) {
        return setTimeout(() => {
          refreshTokens(authenticationInfo);
        }, refreshTime);
      } else {
        // If the token is already expired or very close to expiration, refresh immediately
        refreshTokens(authenticationInfo);
      }
    }

    return null;
  };

  useEffect(() => {
    const timerId = refresh();

    return () => {
      // Cleanup on unmount or when authState changes
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [authenticationInfo, refreshTokens]);
};
