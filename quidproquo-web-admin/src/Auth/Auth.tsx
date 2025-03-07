import { authContext, BubbleQpqReducerActions, useQpqReducer } from 'quidproquo-web-react';

import { ReactNode, useEffect } from 'react';

import { isLoggedOn } from './logic/isLoggedOn';
import { askAuthMain } from './logic/runtime/askAuthMain';
import { authInitalState, authLogic, authReducer } from './logic';
import { Login } from './Login';

interface AuthProps {
  children?: ReactNode;
}

export function Auth({ children }: AuthProps) {
  const [api, state, dispatch] = useQpqReducer(authLogic, authReducer, authInitalState, askAuthMain);

  const isAuthenticated = isLoggedOn(state);

  return (
    <BubbleQpqReducerActions dispatch={dispatch}>
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
    </BubbleQpqReducerActions>
  );
}
