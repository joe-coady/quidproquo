import { getUniqueKeyFromQpqFunctionRuntime, StoryResult } from 'quidproquo-core';

import { Typography } from '@mui/material';

import { GenericFunctionRenderer, genericFunctionRendererStyles } from './actionComponents/genericActionRenderer/AnyVariableView';

interface LogSummaryDetailsProps {
  log: StoryResult<any>;
}

export const LogSummaryDetails = ({ log }: LogSummaryDetailsProps) => {
  const totalRuntime = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();
  const functionKey = log.qpqFunctionRuntimeInfo ? getUniqueKeyFromQpqFunctionRuntime(log.qpqFunctionRuntimeInfo) : 'unknownMahLord';

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
            <div>// src: {functionKey}</div>
            {log.fromCorrelation && <div>// Caller: {log.fromCorrelation}</div>}
            <div>
              // Total Runtime: <span style={genericFunctionRendererStyles.highlightComment}>{totalRuntime} ms</span>
            </div>
            <div>// //////////////////////////////////////////////////////</div>
          </div>
          <GenericFunctionRenderer functionName={functionKey.split('::').pop() || 'unknown'} args={log.input} expanded={true} />
        </pre>
      </div>
    </>
  );
};
