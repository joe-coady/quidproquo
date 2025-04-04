import { RuntimeTypes } from '../constants';
import { SearchParams } from '../types';
import { getLogs } from './getLogs';

export const searchLogs = async (searchParams: SearchParams, apiBaseUrl: string, accessToken?: string, callback?: (progress: number) => void) => {
  const updateProgress = (progress: number) => {
    if (callback) {
      callback(progress);
    }
  };

  const effectiveRuntimeTypes = searchParams.runtimeType === 'ALL' ? RuntimeTypes.filter((type) => type !== 'ALL') : [searchParams.runtimeType];

  let progress = 0;
  const totalCount = effectiveRuntimeTypes.length;

  updateProgress(0);

  const allLogs: any[][] = await Promise.all(
    effectiveRuntimeTypes.flatMap((type) =>
      getLogs(
        `/log/list`,
        type,
        searchParams.startIsoDateTime,
        searchParams.endIsoDateTime,
        searchParams.serviceFilter,
        searchParams.infoFilter,
        searchParams.errorFilter,
        searchParams.userFilter,
        searchParams.deep,
        searchParams.onlyErrors || !!searchParams.errorFilter,
        apiBaseUrl,
        accessToken,
      ).finally(() => {
        progress = progress + 1;

        updateProgress((progress / totalCount) * 100);
      }),
    ),
  );

  const sortedLogs = allLogs.flat().sort((a, b) => {
    const dateA = new Date(a.startedAt);
    const dateB = new Date(b.startedAt);
    // For descending order, use dateB - dateA
    // For ascending order, use dateA - dateB
    return dateB.getTime() - dateA.getTime();
  });

  return sortedLogs;
};
