import { ReactNode, useState } from 'react';

import { login } from "../LogViewer/logic/login";
import { respondToAuthChallenge } from "../LogViewer/logic/respondToAuthChallenge";

import { Login } from "./Login";
import { AuthChallengeNewPasswordRequired } from "./AuthChallengeNewPasswordRequired"
import { AuthState } from '../types';
import { authContext } from './authContext';

interface AuthProps {
  children?: ReactNode;
}


export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    username: "",
    password: ""
  });

  const onLogin = async () => {
    try {
      const result = await login(authState.username, authState.password);
      setAuthState((currentAuthState) => ({ ...currentAuthState, challenge: result.challenge, session: result.session, authenticationInfo: result.authenticationInfo }));
    } catch (error) {
      console.log("AuthError: ", `${error}`)
    }
  }

  const onRespondToAuthChallenge = async (newPassword: string) => {
    const result = await respondToAuthChallenge(
      authState.username,
      authState.session!,
      authState.challenge!,
      newPassword
    );

    setAuthState((currentAuthState) => ({
      ...currentAuthState,
      
      challenge: result.challenge || "NONE",
      session: result.session,
      password: "",
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

    authState,
  }
}

export function Auth({ children }: AuthProps) {
  const { onLogin, authState, setUsername, setPassword, onRespondToAuthChallenge } = useAuth();

  const isLoggedIn = !!authState.authenticationInfo?.accessToken;

  if (authState.challenge === "NEW_PASSWORD_REQUIRED") {
    return <AuthChallengeNewPasswordRequired onRespondToAuthChallenge={onRespondToAuthChallenge} authState={authState} />
  }

  return (
    <>
      { !isLoggedIn && <Login setUsername={setUsername} setPassword={setPassword} username={authState.username} password={authState.password} onLogin={onLogin} authState={authState} />}
      { isLoggedIn && <authContext.Provider value={authState}>
        {children}
      </authContext.Provider> }
    </>
  );
}