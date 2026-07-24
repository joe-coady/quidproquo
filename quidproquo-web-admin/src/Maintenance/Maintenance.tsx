import { WebSocketQueueMaintenanceLevel, WebSocketQueueServerEventPayloadMaintenance } from 'quidproquo-features';
import { useAuthAccessToken, useBaseUrlResolvers } from 'quidproquo-web-react';

import { useState } from 'react';
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

import { apiRequestPost } from '../logic';

const DEFAULT_REASON = 'The site is undergoing a scheduled update';

// Publishes maintenance begin/end over the APPLICATION websocket (via the admin
// maintenance route). Low = informational banner, users keep working; High =
// frontends lock the UI until the end message.
export function Maintenance() {
  const urlResolvers = useBaseUrlResolvers();
  const accessToken = useAuthAccessToken();

  const [reason, setReason] = useState(DEFAULT_REASON);
  const [level, setLevel] = useState<WebSocketQueueMaintenanceLevel>(WebSocketQueueMaintenanceLevel.Low);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ severity: 'success' | 'error'; text: string } | null>(null);

  const publish = async (active: boolean) => {
    setBusy(true);
    setStatus(null);

    try {
      const payload: WebSocketQueueServerEventPayloadMaintenance = { active, level, message: reason };
      await apiRequestPost('/maintenance/set', payload, urlResolvers.getApiUrl(), accessToken);
      setStatus({
        severity: 'success',
        text: active ? `Maintenance started (${level}) - users have been notified` : 'Maintenance ended - users have been notified',
      });
    } catch (error) {
      setStatus({ severity: 'error', text: `Failed to publish maintenance message: ${error}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 900 }}>
      <Typography variant="h5">Maintenance</Typography>
      <Typography color="text.secondary" variant="body2">
        Broadcast a maintenance notice to every connected user. Low shows a banner and lets them keep working; High locks the UI (their unsaved work
        is preserved) until you press End.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField fullWidth label="Reason" onChange={(e) => setReason(e.target.value)} size="small" value={reason} />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="maintenance-level-label">Level</InputLabel>
          <Select
            label="Level"
            labelId="maintenance-level-label"
            onChange={(e) => setLevel(e.target.value as WebSocketQueueMaintenanceLevel)}
            value={level}
          >
            <MenuItem value={WebSocketQueueMaintenanceLevel.Low}>Low</MenuItem>
            <MenuItem value={WebSocketQueueMaintenanceLevel.High}>High</MenuItem>
          </Select>
        </FormControl>

        <Button disabled={busy} onClick={() => publish(true)} variant="contained">
          Begin
        </Button>
        <Button disabled={busy} onClick={() => publish(false)} variant="outlined">
          End
        </Button>
      </Box>

      {status && <Alert severity={status.severity}>{status.text}</Alert>}
    </Box>
  );
}
