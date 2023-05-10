import { useCallback } from 'react';
import { SearchParams } from '../../TopSection';
import { useAsyncLoading } from '../../view';
import { searchLogs } from '../logic';

export const useOnSearch = (
  searchParams: SearchParams,
  serviceLogEndpoints: string[],
  setLogs: (logs: any) => void,
) => {
  const onSearch = useCallback(async () => {
    const newLogs = await searchLogs(searchParams, serviceLogEndpoints);
    setLogs(newLogs);
  }, [setLogs, searchLogs, searchParams, serviceLogEndpoints]);

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return onSearchWithLoading;
};
