import { useState, useMemo, useEffect } from 'react';
import { SearchParams } from '../types';

import { useOnSearch } from './useOnSearch';
import { filterLogs, getOnRowClick } from '../logic';

declare global {
  interface Window {
    logs: any;
    viewLog: any;
  }
}

export const useLogManagement = () => {
  const [selectedLogCorrelation, setSelectedLogCorrelation] = useState<string>('');
  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    window.logs = logs;
    window.viewLog = (log: any) => {setSelectedLogCorrelation(log.correlation)};
  }, [logs]);

  useEffect(() => {
    console.log("logs attached to window, try: viewLog(logs[0])");
  }, []);

  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const currentDate = new Date();
    const isoDateNow = currentDate.toISOString();

    const threeHoursAgo = new Date(currentDate.getTime() - 30 * 60 * 60 * 1000);
    const isoDateThreeHoursAgo = threeHoursAgo.toISOString();

    return {
      runtimeType: 'EXECUTE_STORY',
      startIsoDateTime: isoDateThreeHoursAgo,
      endIsoDateTime: isoDateNow,
      errorFilter: '',
    };
  });

  const [searchProgress, onSearch] = useOnSearch(searchParams, setLogs);

  const filteredLogs = useMemo(
    () => filterLogs(searchParams.errorFilter, logs),
    [searchParams.errorFilter, logs],
  );

  const onRowClick = getOnRowClick(setSelectedLogCorrelation);
  const clearSelectedLogCorrelation = () => setSelectedLogCorrelation('');

  return {
    selectedLogCorrelation,
    logs,
    searchParams,
    setSearchParams,
    onSearch,
    filteredLogs,
    onRowClick,
    clearSelectedLogCorrelation,
    setSelectedLogCorrelation,
    searchProgress,
  };
};
