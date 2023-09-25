import { ReactNode, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import { login } from "./LogViewer/logic/login";
import { AsyncButton } from './components'

interface AuthProps {
  children?: ReactNode;
}

type AuthState = {
  challenge?: string;
  session?: string;
  username: string;
  password: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    username: "joe.coady@twothousandfivehundred.com",
    password: "7&sip3U9"
  });

  const onLogin = async () => {
    try {
      const result = await login(authState.username, authState.password);
      setAuthState((currentAuthState) => ({ ...currentAuthState, challenge: result.challenge, session: result.session }));
    } catch (error) {
      console.log("AuthError: ", `${error}`)
    }
  }

  const setUsername = (username: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, username }));
  const setPassword = (password: string) => setAuthState((currentAuthState) => ({ ...currentAuthState, password }));

  return {
    setUsername,
    setPassword,

    onLogin,
    authState,
  }
}

export function Auth({ children }: AuthProps) {
  const { onLogin, authState, setUsername, setPassword } = useAuth();

  const isLoggedIn = !authState.challenge && authState.username === "admin" && authState.password === "admin";

  return (
    <>
      { !isLoggedIn && <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box component="form" sx={{ width: '100%', maxWidth: 360 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                autoFocus
                value={authState.username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="password"
                label="Password"
                type="password"
                value={authState.password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <AsyncButton onClick={() => onLogin()}>
                Login
              </AsyncButton>
            </Grid>
            <Grid item xs={12}>
              <pre>
                {JSON.stringify(authState, null, 2)}
              </pre>
            </Grid>
          </Grid>
        </Box>
      </Box>}
      { isLoggedIn && children }
    </>
  );
}