import { useAuthAccessToken, useBaseUrlResolvers, useFastCallback } from 'quidproquo-web-react';
import { LogLog } from 'quidproquo-webserver';

import { useState } from 'react';

import { useAsyncLoading } from '../../../../view';
import { searchLogLogs } from '../logic/searchLogLogs';
import { LogLogSearchParams } from '../types';

export const useLogLogSearchRequest = (
  searchParams: LogLogSearchParams,
  setLogLogs: (logs: LogLog[]) => void,
): [number, (newSearchParams?: LogLogSearchParams) => Promise<any[]>] => {
  const [progress, setProgress] = useState<number>(0);
  const authTokens = useAuthAccessToken();
  const baseUrlResolvers = useBaseUrlResolvers();

  const onSearch = useFastCallback(async (newSearchParams?: LogLogSearchParams) => {
    const newLogs = await searchLogLogs(newSearchParams || searchParams, baseUrlResolvers.getApiUrl(), authTokens, setProgress);

    setLogLogs(newLogs);

    return newLogs;
  });

  const onSearchWithLoading = useAsyncLoading(onSearch);

  return [progress, onSearchWithLoading];
};
