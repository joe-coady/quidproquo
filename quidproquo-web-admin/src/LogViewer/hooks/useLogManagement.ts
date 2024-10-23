import { useEffect,useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { filterLogs, getOnRowClick } from '../logic';
import { SearchParams } from '../types';
import { useOnSearch } from './useOnSearch';

declare global {
  interface Window {
    logs: any;
    viewLog: any;
  }
}

export const useLogManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLogCorrelation = searchParams.get('correlation') || '';

  const setSelectedLogCorrelation = (correlation: string) => {
    if (correlation) {
      setSearchParams({ correlation });
    } else {
      setSearchParams({});
    }
  };

  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    window.logs = logs;
    window.viewLog = (log: any) => {
      setSelectedLogCorrelation(log.correlation);
    };
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
      deep: '',

      onlyErrors: false,
    };
  });

  const [searchProgress, onSearch] = useOnSearch(searchParamsState, setLogs);

  const filteredLogs = useMemo(() => filterLogs(searchParamsState.errorFilter, logs), [searchParamsState.errorFilter, logs]);

  const onRowClick = getOnRowClick(setSelectedLogCorrelation);
  const clearSelectedLogCorrelation = () => setSelectedLogCorrelation('');

  return {
    selectedLogCorrelation,
    logs,
    searchParams: searchParamsState,
    setSearchParams: setSearchParamsState,
    onSearch,
    filteredLogs,
    onRowClick,
    clearSelectedLogCorrelation,
    setSelectedLogCorrelation,
    searchProgress,
  };
};
