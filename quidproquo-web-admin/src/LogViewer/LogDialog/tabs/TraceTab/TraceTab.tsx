import { QpqExecutionTrace } from 'quidproquo-core';
import { useAuthAccessToken, useBaseUrlResolvers, useSubscribeToWebSocketEvent } from 'quidproquo-web-react';
import { WebSocketQueueQpqAdminServerEventMessageTraceDone, WebSocketQueueQpqAdminServerMessageEventType } from 'quidproquo-webserver';

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material';

import { getLogTrace } from '../../../logic';
import { TraceViewer } from '../../../TraceViewer';
import { AsyncStoryState } from '../../hooks';
import { MovedToColdStorage } from '../../MovedToColdStorage';

interface TraceTabProps {
  log: AsyncStoryState;
  isVisible: boolean;
}

// Backstop for a missed TraceDone websocket message (reconnect gaps, dev servers
// without the admin socket). checkOnly polls never trigger trace runs.
const PENDING_POLL_MS = 15_000;

// Async trace flow: the first open requests the trace — a stored one loads immediately,
// otherwise the log service kicks off a fire-and-forget trace in the owning service and
// this tab waits for its TraceDone websocket push (with a slow checkOnly poll as a
// fallback). See trace-replay-plan.md.
export const TraceTab: React.FC<TraceTabProps> = ({ log, isVisible }) => {
  const urlResolvers = useBaseUrlResolvers();
  const accessToken = useAuthAccessToken();

  const [trace, setTrace] = useState<QpqExecutionTrace | undefined>(undefined);
  const [isWaiting, setIsWaiting] = useState(false);
  const [traceError, setTraceError] = useState<string | undefined>(undefined);
  const [hasRequested, setHasRequested] = useState(false);

  // The request a stale async response must not clobber (rapid re-runs, dialog reuse)
  const requestVersionRef = useRef(0);

  const requestTrace = async (options: { refresh?: boolean; checkOnly?: boolean }) => {
    const requestVersion = ++requestVersionRef.current;
    if (!options.checkOnly) {
      setIsWaiting(true);
      setTraceError(undefined);
    }

    try {
      const result = await getLogTrace(urlResolvers.getApiUrl(), log.logCorrelation, options, accessToken);
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      if (result.trace) {
        setTrace(result.trace);
        setIsWaiting(false);
      } else if (result.pending) {
        setIsWaiting(true);
      } else if (!options.checkOnly) {
        setTraceError('No trace was produced for this log');
        setIsWaiting(false);
      }
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }
      setTraceError(error instanceof Error ? error.message : String(error));
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    if (isVisible && !hasRequested && !log.isLoading && !log.isLogInColdStorage) {
      setHasRequested(true);
      // First open serves a stored trace when one exists; otherwise starts one
      requestTrace({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, hasRequested, log.isLoading, log.isLogInColdStorage]);

  // The owning service finished tracing — the log service pushed the result
  useSubscribeToWebSocketEvent(
    WebSocketQueueQpqAdminServerMessageEventType.TraceDone,
    (webSocketService, message: WebSocketQueueQpqAdminServerEventMessageTraceDone) => {
      if (message.payload.correlation !== log.logCorrelation || !isWaiting) {
        return;
      }

      if (message.payload.succeeded) {
        requestTrace({ checkOnly: true });
      } else {
        setTraceError(message.payload.errorText || 'Trace failed');
        setIsWaiting(false);
      }
    },
  );

  // Poll fallback while waiting — checkOnly, so it can never stack trace runs
  useEffect(() => {
    if (!isWaiting) {
      return;
    }
    const pollTimer = setInterval(() => requestTrace({ checkOnly: true }), PENDING_POLL_MS);
    return () => clearInterval(pollTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaiting]);

  if (log.isLoading) {
    return <div>Loading...</div>;
  }

  if (log.isLogInColdStorage) {
    return <MovedToColdStorage guid={log.logCorrelation} />;
  }

  if (isWaiting) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ mb: 1 }} variant="body2">
          Tracing in {log.log?.moduleName ? `the ${log.log.moduleName} service` : 'the owning service'} — replaying the log and recording every
          statement. This can take a minute; the result appears here when it lands.
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (traceError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          action={
            <Button color="inherit" onClick={() => requestTrace({ refresh: true })} size="small">
              Retry
            </Button>
          }
          severity="error"
        >
          {traceError}
        </Alert>
      </Box>
    );
  }

  if (!trace) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 1 }}>
        <Button onClick={() => requestTrace({ refresh: true })} size="small">
          Re-run Trace
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <TraceViewer trace={trace} />
      </Box>
    </Box>
  );
};
