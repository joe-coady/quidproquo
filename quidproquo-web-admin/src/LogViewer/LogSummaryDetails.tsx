import { Typography } from '@mui/material';
import { StoryResult } from 'quidproquo-core';

interface LogSummaryDetailsProps {
  log: StoryResult<any>;
}

export const LogSummaryDetails = ({ log }: LogSummaryDetailsProps) => {
  const totalRuntime = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        {log.runtimeType} - {log.moduleName}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {log.tags.join(', ')}
      </Typography>
      {log.fromCorrelation && (
        <Typography variant="body1" gutterBottom>
          Caller: {log.fromCorrelation}
        </Typography>
      )}
      <Typography variant="body1" gutterBottom>
        Total Runtime: {totalRuntime} ms
      </Typography>
    </div>
  );
};
