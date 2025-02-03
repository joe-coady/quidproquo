import { LogLevelEnum, QpqPagedData } from 'quidproquo-core';
import { LogLog } from 'quidproquo-webserver';

import { apiRequestPost } from '../../../../logic';

export const getLogLogs = async (
  logLevel: LogLevelEnum,
  startIsoDateTime: string,
  endIsoDateTime: string,
  serviceFilter: string,
  msgFilter: string,
  apiBaseUrl: string,
  accessToken?: string,
): Promise<LogLog[]> => {
  let logs: LogLog[] = [];
  let nextPageKey = undefined;

  const requestSpan = {
    startIsoDateTime,
    endIsoDateTime,
    logLevel,
    serviceFilter,
    msgFilter,
  };

  do {
    let newLogs: QpqPagedData<LogLog> = await apiRequestPost<QpqPagedData<LogLog>>(
      `/loglog/list`,
      {
        ...requestSpan,
        nextPageKey: nextPageKey,
      },
      apiBaseUrl,
      accessToken,
    );

    logs = [...logs, ...newLogs.items];

    nextPageKey = newLogs.nextPageKey;
  } while (nextPageKey);

  return logs;
};
