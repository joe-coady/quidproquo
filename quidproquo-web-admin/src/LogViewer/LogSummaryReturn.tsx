import { Typography } from '@mui/material';
import { StoryResult } from 'quidproquo-core';

interface LogSummaryReturnProps {
  log: StoryResult<any>;
}

export const LogSummaryReturn = ({ log }: LogSummaryReturnProps) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        {log.error ? 'Thrown Error' : 'Returned'}
      </Typography>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {log.error ? JSON.stringify(log.error, null, 2) : JSON.stringify(log.result, null, 2)}
      </pre>
    </div>
  );
};
