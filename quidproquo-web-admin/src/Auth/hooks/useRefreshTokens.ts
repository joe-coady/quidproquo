import { useEffect, useRef } from 'react';
import { AuthState } from '../../types';

export const useRefreshTokens = (
  authState: AuthState,
  refreshTokens: (authState: AuthState) => void,
) => {
  const refresh = () => {
    const { refreshToken, expiresAt } = authState.authenticationInfo || {};

    if (refreshToken && expiresAt) {
      const now = new Date().toISOString();
      const timeToExpire = new Date(expiresAt).getTime() - new Date(now).getTime();

      // Refresh the token 10 minutes before it expires to ensure there's a buffer
      const bufferTime = 10 * 60 * 1000;
      const refreshTime = timeToExpire - bufferTime;

      if (refreshTime > 0) {
        return setTimeout(() => refreshTokens(authState), refreshTime);
      } else {
        // If the token is already expired or very close to expiration, refresh immediately
        refreshTokens(authState);
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
  }, [authState, refreshTokens]);
};
