import { apiRequestPost } from '../../logic';
import { QpqLogListLog, StoryResultMetadataLog } from '../../types';

export const getLogs = async (
  url: string,
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
): Promise<StoryResultMetadataLog[]> => {
  var logs: StoryResultMetadataLog[] = [];
  var newLogs: QpqLogListLog;
  var nextPageKey = undefined;

  const requestSpan = {
    startIsoDateTime,
    endIsoDateTime,
    runtimeType,
  };

  do {
    newLogs = await apiRequestPost<QpqLogListLog>(url, {
      ...requestSpan,
      nextPageKey: nextPageKey,      
    });

    logs = [...logs, ...newLogs.items];

    nextPageKey = newLogs.nextPageKey;
  } while (nextPageKey);

  return logs;
};
