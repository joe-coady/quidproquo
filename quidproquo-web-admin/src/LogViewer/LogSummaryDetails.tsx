import { StoryResult } from 'quidproquo-core';
import { Typography } from '@mui/material';

import { GenericFunctionRenderer, genericFunctionRendererStyles } from './actionComponents/genericActionRenderer/AnyVariableView';

interface LogSummaryDetailsProps {
  log: StoryResult<any>;
}

export const LogSummaryDetails = ({ log }: LogSummaryDetailsProps) => {
  const totalRuntime = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();

  return (
    <>
      <div>
        <Typography variant="h5" gutterBottom>
          {log.runtimeType} - {log.moduleName}
        </Typography>
      </div>
      <div>
        <pre style={genericFunctionRendererStyles.pre}>
          <div style={genericFunctionRendererStyles.commentBlock}>
            <div>// //////////////////////////////////////////////////////</div>
            <div>// src: {log.tags.join(', ')}</div>
            {log.fromCorrelation && <div>// Caller: {log.fromCorrelation}</div>}
            <div>
              // Total Runtime: <span style={genericFunctionRendererStyles.highlightComment}>{totalRuntime} ms</span>
            </div>
            <div>// //////////////////////////////////////////////////////</div>
          </div>
          <GenericFunctionRenderer functionName={log.tags.join('::').split('::').pop() || 'unknown'} args={log.input} expanded={true} />
        </pre>
      </div>
    </>
  );
};
