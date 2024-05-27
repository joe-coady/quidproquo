import { StoryResultMetadata, QpqLogList } from 'quidproquo-core';
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
  accessToken?: string,
): Promise<StoryResultMetadata[]> => {
  var logs: StoryResultMetadata[] = [];
  var newLogs: QpqLogList;
  var nextPageKey = undefined;

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
      accessToken,
    );

    logs = [...logs, ...newLogs.items];

    nextPageKey = newLogs.nextPageKey;
  } while (nextPageKey);

  return logs;
};
