import { StoryResult } from 'quidproquo-core';

import { useState } from 'react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import { AnyVariableView, genericFunctionRendererStyles } from './actionComponents';

interface LogSummaryReturnProps {
  log: StoryResult<any>;
}

export const LogSummaryReturn = ({ log }: LogSummaryReturnProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <Box display="flex" alignItems="center">
        <Typography variant="h6" gutterBottom>
          {log.error ? 'Thrown Error' : 'Returned'}
        </Typography>
        <Tooltip title={expanded ? 'Collapse' : 'Expand'}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        <pre style={genericFunctionRendererStyles.pre}>
          {log.error ? <AnyVariableView value={log.error} expanded={expanded} /> : <AnyVariableView value={log.result} expanded={expanded} />}
        </pre>
      </pre>
    </div>
  );
};
