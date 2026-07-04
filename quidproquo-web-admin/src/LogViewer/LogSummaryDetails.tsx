import { getUniqueKeyFromQpqFunctionRuntime, StoryResult } from 'quidproquo-core';

import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { GenericFunctionRenderer, genericFunctionRendererStyles } from './actionComponents/genericActionRenderer/AnyVariableView';

interface LogSummaryDetailsProps {
  log: StoryResult<any>;
}

const runtimeTypeToCamelCase = (runtimeType: string): string => runtimeType.toLowerCase().replace(/_(\w)/g, (_, char) => char.toUpperCase());

export const LogSummaryDetails = ({ log }: LogSummaryDetailsProps) => {
  const [expanded, setExpanded] = useState(false);

  const totalRuntime = new Date(log.finishedAt).getTime() - new Date(log.startedAt).getTime();
  const functionKey = log.qpqFunctionRuntimeInfo
    ? getUniqueKeyFromQpqFunctionRuntime(log.qpqFunctionRuntimeInfo)
    : runtimeTypeToCamelCase(log.runtimeType);

  return (
    <>
      <Box alignItems="center" display="flex">
        <Typography gutterBottom variant="h5">
          {log.runtimeType} - {log.moduleName}
        </Typography>
        <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>
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
          <GenericFunctionRenderer args={log.input} expanded={expanded} functionName={functionKey.split('::').pop() || 'unknown'} />
        </pre>
      </div>
    </>
  );
};
