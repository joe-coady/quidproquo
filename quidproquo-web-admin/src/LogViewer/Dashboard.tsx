import { StoryResultMetadata } from 'quidproquo-core';
import { uniqueBy } from 'quidproquo-web';
import { useRunEvery, useThrottledMemo } from 'quidproquo-web-react';
import { useSubscribeToWebSocketEvent } from 'quidproquo-web-react';
import { LogMetadata, WebSocketAdminServerEventMessageLogMetadata, WebsocketAdminServerMessageEventType } from 'quidproquo-webserver';

import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Paper,Typography } from '@mui/material';

import { TabViewBox } from '../components';
import { useIsLoading } from '../view';
import { useLogSearch } from './hooks';
import { LogMetadataGrid } from './LogMetadataGrid';

const getLogCountForSinceXDaysAgo = (logs: LogMetadata[], daysAgo: number) => {
  const currentDate = new Date();
  const daysAgoDate = new Date(currentDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const daysAgoString = daysAgoDate.toISOString();

  const logCount = logs.reduce((count, log) => (daysAgoString < log.startedAt && !log.checked ? count + 1 : count), 0);

  return logCount;
};

const getHoursSinceStartOfDay = (): number => {
  const now = new Date();
  return now.getHours();
};

interface DashboardProps {}

export const Dashboard: React.FC<DashboardProps> = () => {
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
      deep: '',

      onlyErrors: true,
    };

    onSearch(searchParams);
  }, []);

  useSubscribeToWebSocketEvent(
    WebsocketAdminServerMessageEventType.LogMetadata,
    (webSocketService, message: WebSocketAdminServerEventMessageLogMetadata) => {
      // Add the log to the list if its an error
      if (message.payload.log.error) {
        setRealtimeLogs((prevLogs) => [message.payload.log, ...prevLogs.filter((pl) => pl.correlation !== message.payload.log.correlation)]);
      }
    },
  );

  const hoursPassedToday = useRunEvery(getHoursSinceStartOfDay, 60);

  const allLogs = useThrottledMemo(() => {
    const uniqueLogs = uniqueBy([...realtimeLogs, ...weeklyLogs], (log) => log.correlation);
    return uniqueLogs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [realtimeLogs, weeklyLogs]);

  const dailyErrorCount = useMemo(() => getLogCountForSinceXDaysAgo(allLogs, hoursPassedToday / 24), [allLogs, getHoursSinceStartOfDay]);
  const weeklyErrorCount = useMemo(() => getLogCountForSinceXDaysAgo(allLogs, 7), [allLogs]);

  return (
    <TabViewBox>
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
    </TabViewBox>
  );
};
