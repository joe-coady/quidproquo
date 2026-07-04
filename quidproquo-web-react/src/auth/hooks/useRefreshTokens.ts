import { AuthenticationInfo } from 'quidproquo-core';

import { useEffect } from 'react';

import { useFastCallback } from '../../hooks/useFastCallback';

export const useRefreshTokens = (
  authenticationInfo: AuthenticationInfo | undefined,
  refreshTokens: (authenticationInfo: AuthenticationInfo) => Promise<any>,
) => {
  const stableRefreshTokens = useFastCallback(refreshTokens);

  const refresh = () => {
    if (authenticationInfo && authenticationInfo.refreshToken && authenticationInfo.expiresAt) {
      const now = new Date().toISOString();
      const timeToExpire = new Date(authenticationInfo.expiresAt).getTime() - new Date(now).getTime();

      // Refresh the token 10 minutes before it expires to ensure there's a buffer
      const bufferTime = 10 * 60 * 1000;
      const refreshTime = timeToExpire - bufferTime;

      if (refreshTime > 0) {
        return setTimeout(() => {
          stableRefreshTokens(authenticationInfo);
        }, refreshTime);
      } else {
        // If the token is already expired or very close to expiration, refresh immediately
        stableRefreshTokens(authenticationInfo);
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
    // Key on the stable primitives that actually drive a refresh, not the
    // authenticationInfo object itself. Callers commonly derive that object
    // fresh on every render (e.g. an unmemoized selector), so depending on its
    // reference would re-run this effect every render — and when the token is
    // expired/near-expiry the "refresh immediately" branch would then fire a
    // network refresh on every render, an unbounded loop.
  }, [authenticationInfo?.expiresAt, authenticationInfo?.refreshToken]);
};
