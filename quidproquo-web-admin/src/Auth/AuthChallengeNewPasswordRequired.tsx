import { ReactNode, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';

import { AsyncButton } from '../components'
import { AuthState } from '../types';

interface AuthChallengeNewPasswordRequiredProps {
  onRespondToAuthChallenge: (password: string) => Promise<void>;
  authState: AuthState;
}

export function AuthChallengeNewPasswordRequired({ onRespondToAuthChallenge, authState }: AuthChallengeNewPasswordRequiredProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const arePasswordsMatching = newPassword === confirmPassword && newPassword !== '';

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
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
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <AsyncButton onClick={() => onRespondToAuthChallenge(confirmPassword)} disabled={!arePasswordsMatching}>
              Update Password
            </AsyncButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
