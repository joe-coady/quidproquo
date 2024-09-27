import { ReactNode, useState } from 'react';

import { login } from '../LogViewer/logic/login';
import { respondToAuthChallenge } from '../LogViewer/logic/respondToAuthChallenge';

import { Login } from './Login';
import { AuthChallengeNewPasswordRequired } from './AuthChallengeNewPasswordRequired';
import { AuthState } from '../types';
import { authContext, useBaseUrlResolvers } from 'quidproquo-web-react';
import { useRefreshTokens } from 'quidproquo-web-react';
import { refreshTokens } from '../LogViewer/logic/refreshTokens';

interface AuthProps {
  children?: ReactNode;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    username: '',
    password: '',
  });

  const baseUrlResolvers = useBaseUrlResolvers();

  const onLogin = async () => {
    try {
      const result = await login(authState.username, authState.password, baseUrlResolvers.getApiUrl());
      setAuthState((currentAuthState) => ({
        ...currentAuthState,
        challenge: result.challenge,
        session: result.session,
        authenticationInfo: result.authenticationInfo,
      }));
    } catch (error) {
      console.error('AuthError: ', error);
    }
  };

  const refresh = async (authState: AuthState): Promise<void> => {
    try {
      const result = await refreshTokens(authState, baseUrlResolvers.getApiUrl());

      setAuthState((currentAuthState) => ({
        ...currentAuthState,
        challenge: result.challenge,
        session: result.session,
        authenticationInfo: {
          ...(currentAuthState.authenticationInfo || {}),
          ...(result.authenticationInfo || {}),
        },
      }));
    } catch {
      setAuthState((currentAuthState) => ({
        ...currentAuthState,
        authenticationInfo: undefined,
      }));
    }
  };

  const onRespondToAuthChallenge = async (newPassword: string) => {
    const result = await respondToAuthChallenge(
      authState.username,
      authState.session!,
      authState.challenge!,
      newPassword,
      baseUrlResolvers.getApiUrl(),
    );

    setAuthState((currentAuthState) => ({
      ...currentAuthState,
      challenge: result.challenge || 'NONE',
      session: result.session,
      password: '',
      authenticationInfo: result.authenticationInfo,
    }));
  };

  const setUsername = (username: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, username }));
  const setPassword = (password: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, password }));

  return {
    setUsername,
    setPassword,
    onRespondToAuthChallenge,
    onLogin,
    refreshTokens: refresh,
    authState,
  };
};

export function Auth({ children }: AuthProps) {
  const { onLogin, authState, setUsername, setPassword, refreshTokens, onRespondToAuthChallenge } = useAuth();

  useRefreshTokens(authState, refreshTokens);

  const isLoggedIn = !!authState.authenticationInfo?.accessToken;

  if (authState.challenge === 'NEW_PASSWORD_REQUIRED') {
    return <AuthChallengeNewPasswordRequired onRespondToAuthChallenge={onRespondToAuthChallenge} authState={authState} />;
  }

  return (
    <>
      {!isLoggedIn && (
        <Login setUsername={setUsername} setPassword={setPassword} username={authState.username} password={authState.password} onLogin={onLogin} />
      )}
      {isLoggedIn && <authContext.Provider value={authState}>{children}</authContext.Provider>}
    </>
  );
}
