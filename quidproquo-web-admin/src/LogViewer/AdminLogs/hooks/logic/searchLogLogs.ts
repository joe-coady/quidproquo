import { LogLevelEnum, resolveLookupValues } from 'quidproquo-core';
import { LogLog } from 'quidproquo-webserver';

import { LogLogSearchParams } from '../types';
import { getLogLogs } from './getLogLogs';

export const searchLogLogs = async (
  searchParams: LogLogSearchParams,
  apiBaseUrl: string,
  accessToken?: string,
  callback?: (progress: number) => void,
) => {
  const logLevels = resolveLookupValues([searchParams.logLevelLookup], LogLevelEnum);
  console.log('logLevels: ', logLevels);

  let progress = 0;
  const totalCount = logLevels.length;

  callback?.(0);
  const allLogs: LogLog[][] = await Promise.all(
    logLevels.flatMap((logLevel) =>
      getLogLogs(
        logLevel,
        searchParams.startIsoDateTime,
        searchParams.endIsoDateTime,
        searchParams.serviceFilter,
        searchParams.msgFilter,
        apiBaseUrl,
        accessToken,
      ).finally(() => {
        progress = progress + 1;

        callback?.((progress / totalCount) * 100);
      }),
    ),
  );

  const sortedLogs = allLogs.flat().sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    // For descending order, use dateB - dateA
    // For ascending order, use dateA - dateB
    return dateB.getTime() - dateA.getTime();
  });

  return sortedLogs;
};
