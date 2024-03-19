import { Box, Typography } from '@mui/material';
import { ErrorsOverTime } from './charts/ErrorsOverTime';
import { RequestsByService } from './charts/RequestsByService';
import { ErrorsByType } from './charts/ErrorsByType';
import { SearchParams } from './types';
import { CostPerService } from './charts/CostPerService';

interface DashboardProps {
  logs: any[];
  searchParams: SearchParams;
}

export const Dashboard = ({ logs, searchParams }: DashboardProps) => {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <ErrorsOverTime logs={logs} searchParams={searchParams} />
      <RequestsByService logs={logs} searchParams={searchParams} />
      <ErrorsByType logs={logs} />
      <CostPerService logs={logs} />
    </Box>
  );
};
