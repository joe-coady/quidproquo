import { BubbleQpqReducerActions, useQpqReducer } from 'quidproquo-web-react';

import { ReactNode } from 'react';

import { authInitalState, authLogic, authReducer } from './logic';
import { Login } from './Login';

interface AuthProps {
  children?: ReactNode;
}

// export const useAuth = () => {
//   const [authState, setAuthState] = useState<AuthState>({
//     username: '',
//     password: '',
//   });

//   const baseUrlResolvers = useBaseUrlResolvers();

//   const onLogin = async () => {
//     try {
//       const result = await login(authState.username, authState.password, baseUrlResolvers.getApiUrl());
//       setAuthState((currentAuthState) => ({
//         ...currentAuthState,
//         challenge: result.challenge,
//         session: result.session,
//         authenticationInfo: result.authenticationInfo,
//       }));
//     } catch (error) {
//       console.error('AuthError: ', error);
//     }
//   };

//   const refresh = async (authInfo: AuthenticationInfo): Promise<void> => {
//     try {
//       const result = await refreshTokens(authInfo, baseUrlResolvers.getApiUrl());

//       setAuthState((currentAuthState) => ({
//         ...currentAuthState,
//         challenge: result.challenge,
//         session: result.session,
//         authenticationInfo: {
//           ...(currentAuthState.authenticationInfo || {}),
//           ...(result.authenticationInfo || {}),
//         },
//       }));
//     } catch {
//       setAuthState((currentAuthState) => ({
//         ...currentAuthState,
//         authenticationInfo: undefined,
//       }));
//     }
//   };

//   const onRespondToAuthChallenge = async (newPassword: string) => {
//     const result = await respondToAuthChallenge(
//       authState.username,
//       authState.session!,
//       authState.challenge!,
//       newPassword,
//       baseUrlResolvers.getApiUrl(),
//     );

//     setAuthState((currentAuthState) => ({
//       ...currentAuthState,
//       challenge: result.challenge || 'NONE',
//       session: result.session,
//       password: '',
//       authenticationInfo: result.authenticationInfo,
//     }));
//   };

//   const setUsername = (username: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, username }));
//   const setPassword = (password: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, password }));

//   return {
//     setUsername,
//     setPassword,
//     onRespondToAuthChallenge,
//     onLogin,
//     refreshTokens: refresh,
//     authState,
//   };
// };

export function Auth({ children }: AuthProps) {
  const [api, state, dispatch] = useQpqReducer(authLogic, authReducer, authInitalState);

  return (
    <BubbleQpqReducerActions dispatch={dispatch}>
      {!state.isLoggedIn && (
        <Login
          setUsername={api.authUISetUsername}
          setPassword={api.authUISetPassword}
          username={state.username}
          password={state.password}
          onLogin={api.authLogin}
        />
      )}
      <>{children}</>
    </BubbleQpqReducerActions>
  );
}
