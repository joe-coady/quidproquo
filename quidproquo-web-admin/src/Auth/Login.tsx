import { ReactNode, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import LockIcon from '@mui/icons-material/Lock';

import { login } from "../LogViewer/logic/login";
import { AsyncButton } from '../components'
import { AuthState } from '../types';
import { Typography } from '@mui/material';

interface LoginProps {
  onLogin: () => Promise<void>;
  
  username: string;
  password: string;

  setUsername: (username: string) => void;
  setPassword: (password: string) => void;
}

export function Login({ username, password, setUsername, setPassword, onLogin }: LoginProps) {
  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box component="form" sx={{ width: '100%', maxWidth: 360 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LockIcon sx={{ marginRight: 1 }} />
              QPQ Admin
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="username"
              label="Username"
              autoFocus
              value={username}
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <AsyncButton onClick={() => onLogin()}>
              Login
            </AsyncButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}