import { StoryResult } from 'quidproquo-core';
import { Box, Typography } from '@mui/material';

interface LogSummaryProps {
  log: StoryResult<any>;
}

export const LogSummary = ({ log }: LogSummaryProps) => {
  const executionTime = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();

  return (
    <Box sx={{ width: 1, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Log Summary
      </Typography>
      <Typography>Correlation ID: {log.correlation}</Typography>
      <Typography>Module Name: {log.moduleName}</Typography>
      <Typography>Runtime Type: {log.runtimeType}</Typography>
      <Typography>Started At: {new Date(log.startedAt).toLocaleString()}</Typography>
      <Typography>Finished At: {new Date(log.finishedAt).toLocaleString()}</Typography>
      <Typography>Execution Time: {executionTime} ms</Typography>
      <Typography>Status: {log.error ? 'Error' : 'Success'}</Typography>
    </Box>
  );
};
