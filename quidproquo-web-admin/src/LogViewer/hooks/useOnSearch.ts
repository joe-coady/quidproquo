import { useCallback } from 'react';
import { SearchParams } from '../types';
import { useAsyncLoading } from '../../view';
import { searchLogs } from '../logic';

export const useOnSearch = (
  searchParams: SearchParams,
  serviceLogEndpoints: string[],
  setLogs: (logs: any) => void,
) => {
  const onSearch = useCallback(
    async (newSearchParams?: SearchParams, shouldSetLogs: boolean = true) => {
      const newLogs = await searchLogs(newSearchParams || searchParams, serviceLogEndpoints);
      if (shouldSetLogs) {
        setLogs(newLogs);
      }

      return newLogs;
    },
    [setLogs, searchLogs, searchParams, serviceLogEndpoints],
  );

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return onSearchWithLoading;
};
