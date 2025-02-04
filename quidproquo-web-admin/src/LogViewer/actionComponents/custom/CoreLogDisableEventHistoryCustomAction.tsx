import { LogDisableEventHistoryActionPayload } from 'quidproquo-core';

import { Box, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';

import { ActionComponent } from '../types';

export const CoreLogDisableEventHistoryCustomAction: ActionComponent<LogDisableEventHistoryActionPayload> = ({ historyItem }) => {
  if (!historyItem.act?.payload) {
    return null;
  }

  const { reason } = historyItem.act.payload;

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Alert severity={'warning'}>
        <Typography variant="body1" fontWeight="bold">
          {reason}
        </Typography>
      </Alert>
    </Box>
  );
};
