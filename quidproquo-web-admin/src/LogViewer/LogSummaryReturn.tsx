import { StoryResult } from 'quidproquo-core';
import { Typography } from '@mui/material';

import { AnyVariableView, genericFunctionRendererStyles } from './actionComponents';

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
        <pre style={genericFunctionRendererStyles.pre}>
          {log.error ? <AnyVariableView value={log.error} expanded={true} /> : <AnyVariableView value={log.result} expanded={true} />}
        </pre>
      </pre>
    </div>
  );
};
