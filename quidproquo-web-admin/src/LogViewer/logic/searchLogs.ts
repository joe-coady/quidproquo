import { getLogs } from './getLogs';
import { SearchParams, RuntimeTypes } from '../../TopSection';

export const searchLogs = async (searchParams: SearchParams, serviceLogEndpoints: string[]) => {
  const effectiveRuntimeTypes =
    searchParams.runtimeType === 'ALL'
      ? RuntimeTypes.filter((type) => type !== 'ALL')
      : [searchParams.runtimeType];

  const allLogs: any[][] = await Promise.all(
    effectiveRuntimeTypes.flatMap((type) =>
      serviceLogEndpoints.map((x) =>
        getLogs(`/${x}/log/list`, type, searchParams.startIsoDateTime, searchParams.endIsoDateTime),
      ),
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
