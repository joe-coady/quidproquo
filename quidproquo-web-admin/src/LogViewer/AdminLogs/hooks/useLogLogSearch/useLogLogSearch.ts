import { LogLog } from 'quidproquo-webserver';

import { useState } from 'react';

import { LogLogSearchParams } from '../types';
import { useLogLogSearchRequest } from '../useLogLogSearchRequest/useLogLogSearchRequest';

export const useLogLogSearch = () => {
  const [logLogs, setLogLogs] = useState<LogLog[]>([]);

  const [searchParamsState, setSearchParamsState] = useState<LogLogSearchParams>(() => {
    const currentDate = new Date();

    const threeHoursAgo = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000);
    const isoDateThreeHoursAgo = threeHoursAgo.toISOString();

    const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const isoDateTomorrow = tomorrow.toISOString();

    return {
      logLevelLookup: 'All',

      startIsoDateTime: isoDateThreeHoursAgo,
      endIsoDateTime: isoDateTomorrow,

      reasonFilter: '',
      serviceFilter: '',
    };
  });

  const [searchProgress, onSearch] = useLogLogSearchRequest(searchParamsState, setLogLogs);

  return {
    logLogs,
    searchParams: searchParamsState,
    setSearchParams: setSearchParamsState,
    searchProgress,
    onSearch,
  };
};
