import { StoryResult } from 'quidproquo-core';
import { useSubscribeToWebSocketEvent, useWebsocketSendEvent } from 'quidproquo-web-react';
import {
  LogMetadata,
  WebSocketAdminClientEventPayloadRefreshLogMetadata,
  WebsocketAdminClientMessageEventType,
  WebSocketAdminServerEventMessageLogMetadata,
  WebSocketAdminServerEventMessageRefreshLogMetadata,
  WebsocketAdminServerMessageEventType,
  WebSocketClientEventMessageMarkLogChecked,
  WebsocketClientMessageEventType,
} from 'quidproquo-webserver';

import { useEffect, useState } from 'react';
import { Box, Checkbox, CircularProgress, FormControlLabel, Typography } from '@mui/material';

interface LogSummaryProps {
  log: StoryResult<any>;
}

export const LogSummary = ({ log }: LogSummaryProps) => {
  const [checkedLoading, setCheckedLoading] = useState(true);
  const [logMetadata, setLogMetadata] = useState<LogMetadata | null>(null);

  const sendMessage = useWebsocketSendEvent();

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckedLoading(true);

    const checkEvent: WebSocketClientEventMessageMarkLogChecked = {
      type: WebsocketClientMessageEventType.MarkLogChecked,
      payload: {
        correlationId: log.correlation,
        checked: event.target.checked,
      },
    };

    sendMessage(checkEvent);
  };

  useSubscribeToWebSocketEvent(
    WebsocketAdminServerMessageEventType.LogMetadata,
    (webSocketService, message: WebSocketAdminServerEventMessageLogMetadata) => {
      if (message.payload.log.correlation !== log.correlation) {
        return;
      }

      setCheckedLoading(false);
      setLogMetadata(message.payload.log);
    },
  );

  useEffect(() => {
    const checkEvent: WebSocketAdminServerEventMessageRefreshLogMetadata = {
      type: WebsocketAdminClientMessageEventType.RefreshLogMetadata,
      payload: {
        correlationId: log.correlation,
      },
    };

    sendMessage(checkEvent);
  }, [log.correlation]);

  return (
    <Box sx={{ width: 1, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Log Summary
      </Typography>
      <Typography>Correlation ID: {log.correlation}</Typography>
      <FormControlLabel
        control={checkedLoading ? <CircularProgress size={24} /> : <Checkbox checked={!!logMetadata?.checked} onChange={handleCheckboxChange} />}
        label="Mark as done"
      />
    </Box>
  );
};
