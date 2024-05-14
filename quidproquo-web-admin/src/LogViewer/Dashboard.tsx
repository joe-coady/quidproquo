import React from 'react';

import { Box, Grid, Typography, Paper } from '@mui/material';

import { LogMetadataGrid } from './LogMetadataGrid';

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = ({}) => {
  const dailyErrorCount = 30;
  const weeklyErrorCount = 30;

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Daily Errors</Typography>
            <Typography variant="h4">{dailyErrorCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Weekly Errors</Typography>
            <Typography variant="h4">{weeklyErrorCount}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <LogMetadataGrid logs={[]} isLoading={false} />
      </Box>
    </Box>
  );
};
