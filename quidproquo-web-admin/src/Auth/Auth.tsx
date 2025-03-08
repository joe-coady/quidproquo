import { AuthenticateUserChallenge } from 'quidproquo-core';
import { authContext, createQpqRuntimeDefinition, QpqRuntimeEffectCatcher, useQpqRuntime } from 'quidproquo-web-react';

import { ReactNode, useEffect } from 'react';

import { AuthChallengeNewPasswordRequired } from './AuthChallengeNewPasswordRequired/AuthChallengeNewPasswordRequired';
import { isLoggedOn } from './logic/isLoggedOn';
import { askAuthMain } from './logic/runtime/askAuthMain';
import { authInitalState, authLogic, authReducer } from './logic';
import { Login } from './Login';

interface AuthProps {
  children?: ReactNode;
}

const authRuntime = createQpqRuntimeDefinition(authLogic, authInitalState, authReducer);

export function Auth({ children }: AuthProps) {
  const [api, state, dispatch] = useQpqRuntime(authRuntime, askAuthMain);

  const isAuthenticated = isLoggedOn(state);

  if (state.authenticateUserResponse?.challenge === AuthenticateUserChallenge.NEW_PASSWORD_REQUIRED) {
    return (
      <QpqRuntimeEffectCatcher runtime={authRuntime}>
        <AuthChallengeNewPasswordRequired authState={state}></AuthChallengeNewPasswordRequired>
      </QpqRuntimeEffectCatcher>
    );
  }

  return (
    <QpqRuntimeEffectCatcher runtime={authRuntime}>
      {!isAuthenticated && (
        <Login
          setUsername={api.authUISetUsername}
          setPassword={api.authUISetPassword}
          username={state.username}
          password={state.password}
          onLogin={api.authLogin}
        />
      )}
      {isAuthenticated && (
        <authContext.Provider
          value={{
            challenge: state.authenticateUserResponse?.challenge,
            session: state.authenticateUserResponse?.session,
            username: state.username,
            password: state.password,
            authenticationInfo: state.authenticateUserResponse?.authenticationInfo,
          }}
        >
          {children}
        </authContext.Provider>
      )}
    </QpqRuntimeEffectCatcher>
  );
}
