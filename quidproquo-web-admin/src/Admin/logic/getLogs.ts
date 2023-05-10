import { apiRequestPost } from '../../logic';

export const getLogs = async (
  url: string,
  runtimeType: string,
  startIsoDateTime: string,
  endIsoDateTime: string,
) => {
  var logs: any = [];
  var newLogs = null;
  var nextPageKey = undefined;

  const requestSpan = {
    startIsoDateTime,
    endIsoDateTime,
    runtimeType,
  };

  do {
    newLogs = await apiRequestPost(url, {
      ...requestSpan,
      nextPageKey: nextPageKey,
    });
    const cleanLogs = newLogs.items.map((x: any) => ({ ...x, id: x.correlation }));

    logs = [...logs, ...cleanLogs];

    nextPageKey = newLogs.nextPageKey;
  } while (nextPageKey);

  return logs;
};
