/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createAsmjState, useQpqReducer } from 'quidproquo-web-react';

import LockIcon from '@mui/icons-material/Lock';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { AsyncButton } from '../../components';
import { AuthState } from '../logic';
import { authChallengeInitalState, authChallengeLogic, authChallengeReducer } from './logic';

interface AuthChallengeNewPasswordRequiredProps {
  authState: AuthState;
}

const atom = createAsmjState(authChallengeLogic, authChallengeInitalState, authChallengeReducer);

export function AuthChallengeNewPasswordRequired({ authState }: AuthChallengeNewPasswordRequiredProps) {
  const [api, state] = useQpqReducer(atom);
  const arePasswordsMatching = state.passwordA === state.passwordB && state.passwordA !== '';

  if (!authState.authenticateUserResponse || !authState.authenticateUserResponse.challenge || !authState.authenticateUserResponse.session) {
    return <div>Error, missing challenge / session</div>;
  }

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box component="form" sx={{ width: '100%', maxWidth: 360 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LockIcon sx={{ marginRight: 1 }} />
              Password Change Required
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="newPassword"
              label="New Password"
              type="password"
              autoFocus
              value={state.passwordA}
              onChange={(event) => api.authChallengeSetPasswordA(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={state.passwordB}
              onChange={(event) => api.authChallengeSetPasswordB(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <AsyncButton
              onClick={() =>
                api.authChallengeSendPasswords(
                  authState.authenticateUserResponse?.challenge!,
                  authState.authenticateUserResponse?.session!,
                  authState.username,
                )
              }
              disabled={!arePasswordsMatching}
            >
              Update Password
            </AsyncButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
