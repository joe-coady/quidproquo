import { useState, useEffect } from 'react';
import { SearchParams } from '../types';

import { useOnSearch } from './useOnSearch';

declare global {
  interface Window {
    logs: any;
  }
}

export const useLogSearch = () => {
  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    window.logs = logs;
  }, [logs]);

  useEffect(() => {
    console.log('logs attached to window, try: viewLog(logs[0])');
  }, []);

  const [searchParamsState, setSearchParamsState] = useState<SearchParams>(() => {
    const currentDate = new Date();

    const threeHoursAgo = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000);
    const isoDateThreeHoursAgo = threeHoursAgo.toISOString();

    const tomorrow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const isoDateTomorrow = tomorrow.toISOString();

    return {
      runtimeType: 'EXECUTE_STORY',
      startIsoDateTime: isoDateThreeHoursAgo,
      endIsoDateTime: isoDateTomorrow,
      errorFilter: '',
      infoFilter: '',
      serviceFilter: '',
      userFilter: '',
      onlyErrors: false,
    };
  });

  const [searchProgress, onSearch] = useOnSearch(searchParamsState, setLogs);

  return {
    logs,
    searchParams: searchParamsState,
    setSearchParams: setSearchParamsState,
    searchProgress,
    onSearch,
  };
};
