import { StoryResultMetadata, QpqLogList } from 'quidproquo';
import { apiRequestPost } from '../../logic';

export const getLogs = async (
  url: string,
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
  accessToken?: string,
): Promise<StoryResultMetadata[]> => {
  var logs: StoryResultMetadata[] = [];
  var newLogs: QpqLogList;
  var nextPageKey = undefined;

  const requestSpan = {
    startIsoDateTime,
    endIsoDateTime,
    runtimeType,
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
