import { useCallback, useState } from 'react';
import { SearchParams } from '../types';
import { useAsyncLoading } from '../../view';
import { searchLogs } from '../logic';
import { useAuthAccessToken } from '../../Auth/hooks';

export const useOnSearch = (
  searchParams: SearchParams,
  setLogs: (logs: any) => void,
): [number, (newSearchParams?: SearchParams) => Promise<any[]>] => {
  const [progress, setProgress] = useState<number>(0);
  const authTokens = useAuthAccessToken();

  const onSearch = useCallback(
    async (newSearchParams?: SearchParams) => {
      const newLogs = await searchLogs(
        newSearchParams || searchParams,
        authTokens,
        setProgress,
      );

      setLogs(newLogs);

      return newLogs;
    },
    [setLogs, searchLogs, searchParams],
  );

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return [progress, onSearchWithLoading];
};
