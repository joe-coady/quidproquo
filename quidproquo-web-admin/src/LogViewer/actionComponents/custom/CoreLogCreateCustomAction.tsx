import { LogCreateActionPayload, LogLevelEnum, resolveLookupText } from 'quidproquo-core';

import { AlertColor, Box, Typography } from '@mui/material';
import Alert from '@mui/material/Alert';

import { AnyVariableView, genericFunctionRendererStyles } from '../genericActionRenderer';
import { ActionComponent } from '../types';

const getSeverity = (logLevel: LogLevelEnum): AlertColor => {
  switch (logLevel) {
    case LogLevelEnum.Fatal:
    case LogLevelEnum.Error:
      return 'error';
    case LogLevelEnum.Warn:
      return 'warning';
    case LogLevelEnum.Info:
      return 'info';
    case LogLevelEnum.Debug:
    case LogLevelEnum.Trace:
      return 'success';
    default:
      return 'info';
  }
};

export const CoreLogCreateCustomAction: ActionComponent<LogCreateActionPayload> = ({ historyItem, expanded }) => {
  if (!historyItem.act?.payload) {
    return null;
  }

  const { logLevel, msg, data } = historyItem.act.payload;

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Alert severity={getSeverity(logLevel)}>
        <Typography variant="body1" fontWeight="bold">
          {resolveLookupText(logLevel, LogLevelEnum)}
        </Typography>
        <Typography variant="body1">{msg}</Typography>
        {data && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            <pre style={genericFunctionRendererStyles.pre}>
              <AnyVariableView value={data} expanded={expanded} />
            </pre>
          </Typography>
        )}
      </Alert>
    </Box>
  );
};
