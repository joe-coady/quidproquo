import React from 'react';

import { Box, Grid, Typography, Paper } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'timestamp', headerName: 'Timestamp', flex: 1 },
  { field: 'errorType', headerName: 'Error Type', flex: 1 },
  { field: 'message', headerName: 'Message', flex: 2 },
];

const rows = [
  {
    id: 1,
    timestamp: '2023-05-14 10:00:00',
    errorType: 'Type1',
    message: 'Sample error message 1',
  },
  {
    id: 2,
    timestamp: '2023-05-14 10:05:00',
    errorType: 'Type2',
    message: 'Sample error message 2',
  },
  // Add more rows as needed
];

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = ({}) => {
  const dailyErrorCount = 30;
  const weeklyErrorCount = 30;
  const mostCommonError = 'This is an error';

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
      <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="h6">Most Common Error: {mostCommonError}</Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <DataGrid rows={rows} columns={columns} pageSize={5} />
      </Box>
    </Box>
  );
};
