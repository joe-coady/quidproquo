import { StoryResultMetadata } from 'quidproquo-core';
import { BaseUrlResolver } from 'quidproquo-web-react';
import { QpqLogList } from 'quidproquo-webserver';

import { apiRequestPost } from '../../logic';

export const getLogs = async (
  url: string,
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
  serviceFilter: string,
  infoFilter: string,
  errorFilter: string,
  userFilter: string,
  deep: string,
  onlyErrors: boolean,
  apiBaseUrl: string,
  accessToken?: string,
): Promise<StoryResultMetadata[]> => {
  let logs: StoryResultMetadata[] = [];
  let newLogs: QpqLogList;
  let nextPageKey = undefined;

  const requestSpan = {
    startIsoDateTime,
    endIsoDateTime,
    runtimeType,
    serviceFilter,
    errorFilter,
    infoFilter,
    userFilter,
    onlyErrors,
    deep,
  };

  do {
    newLogs = await apiRequestPost<QpqLogList>(
      url,
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
