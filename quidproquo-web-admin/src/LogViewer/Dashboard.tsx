import React, { useEffect, useMemo } from 'react';
import { useRunEvery, useThrottledMemo } from 'quidproquo-web-react';

import {
  WebSocketAdminServerEventMessageLogMetadata,
  WebsocketAdminServerMessageEventType,
} from 'quidproquo-webserver';

import { Box, Grid, Typography, Paper } from '@mui/material';

import { LogMetadataGrid } from './LogMetadataGrid';
import { useLogSearch } from './hooks';
import { useIsLoading } from '../view';
import { StoryResultMetadata } from 'quidproquo-core';
import { useSubscribeToWebSocketEvent } from 'quidproquo-web-react';

const getLogCountForSinceXDaysAgo = (logs: StoryResultMetadata[], daysAgo: number) => {
  const currentDate = new Date();
  const daysAgoDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const daysAgoString = daysAgoDate.toISOString();

  const logCount = logs.reduce(
    (count, log) => (daysAgoString < log.startedAt ? count + 1 : count),
    0,
  );

  return logCount;
};

const getHoursSinceStartOfDay = (): number => {
  const now = new Date();
  return now.getHours();
};

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = ({}) => {
  const [realtimeLogs, setRealtimeLogs] = React.useState<StoryResultMetadata[]>([]);

  const { onSearch, logs: weeklyLogs } = useLogSearch();
  const isLoading = useIsLoading();

  useEffect(() => {
    const currentDate = new Date();

    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const isoDateSevenDaysAgo = sevenDaysAgo.toISOString();

    const now = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const isoDateNow = now.toISOString();

    const searchParams = {
      runtimeType: 'ALL',
      startIsoDateTime: isoDateSevenDaysAgo,
      endIsoDateTime: isoDateNow,
      errorFilter: '',
      infoFilter: '',
      serviceFilter: '',
      userFilter: '',

      onlyErrors: true,
    };

    onSearch(searchParams);
  }, []);

  useSubscribeToWebSocketEvent(
    WebsocketAdminServerMessageEventType.LogMetadata,
    (webSocketService, message: WebSocketAdminServerEventMessageLogMetadata) => {
      setRealtimeLogs((prevLogs) => [...prevLogs, message.payload.log]);
    },
  );

  const hoursPassedToday = useRunEvery(getHoursSinceStartOfDay, 60);

  const allLogs = useThrottledMemo(
    () => [...realtimeLogs, ...weeklyLogs],
    [realtimeLogs, weeklyLogs],
  );

  const dailyErrorCount = useMemo(
    () => getLogCountForSinceXDaysAgo(allLogs, hoursPassedToday / 24),
    [allLogs, getHoursSinceStartOfDay],
  );
  const weeklyErrorCount = useMemo(() => getLogCountForSinceXDaysAgo(allLogs, 7), [allLogs]);

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Daily Errors</Typography>
            <Typography variant="h4">{dailyErrorCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Weekly Errors</Typography>
            <Typography variant="h4">{weeklyErrorCount}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <LogMetadataGrid logs={allLogs} isLoading={isLoading} />
      </Box>
    </Box>
  );
};
