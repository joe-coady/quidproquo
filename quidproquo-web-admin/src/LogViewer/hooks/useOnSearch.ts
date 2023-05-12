import { useCallback, useState } from 'react';
import { SearchParams } from '../types';
import { useAsyncLoading } from '../../view';
import { searchLogs } from '../logic';

export const useOnSearch = (
  searchParams: SearchParams,
  serviceLogEndpoints: string[],
  setLogs: (logs: any) => void,
): [number, (newSearchParams?: SearchParams) => Promise<any[]>] => {
  const [progress, setProgress] = useState<number>(0);

  const onSearch = useCallback(
    async (newSearchParams?: SearchParams) => {
      const newLogs = await searchLogs(
        newSearchParams || searchParams,
        serviceLogEndpoints,
        setProgress,
      );

      setLogs(newLogs);

      return newLogs;
    },
    [setLogs, searchLogs, searchParams, serviceLogEndpoints],
  );

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return [progress, onSearchWithLoading];
};
