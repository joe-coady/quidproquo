import { useState } from 'react';
import { SearchParams } from '../types';
import { useAsyncLoading } from '../../view';
import { searchLogs } from '../logic';

import { useFastCallback, useAuthAccessToken, useBaseUrlResolvers } from 'quidproquo-web-react';

export const useOnSearch = (
  searchParams: SearchParams,
  setLogs: (logs: any) => void,
): [number, (newSearchParams?: SearchParams) => Promise<any[]>] => {
  const [progress, setProgress] = useState<number>(0);
  const authTokens = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();

  const onSearch = useFastCallback(async (newSearchParams?: SearchParams) => {
    const newLogs = await searchLogs(newSearchParams || searchParams, baseUrlResolvers.getApiUrl(), authTokens, setProgress);

    setLogs(newLogs);

    return newLogs;
  });

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return [progress, onSearchWithLoading];
};
