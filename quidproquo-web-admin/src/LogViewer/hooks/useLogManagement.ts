import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useUrlFields } from '../../queryParams';
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
  const { runtimeType, service, startDate, endDate, user, info, deep, error, correlation, setCorrelation, clearCorrelation } = useUrlFields();

  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    window.logs = logs;
    window.viewLog = (log: any) => {
      setCorrelation(log.correlation);
    };
  }, [logs]);

  useEffect(() => {
    console.log('logs attached to window, try: viewLog(logs[0])');
  }, []);

  const searchParams = useMemo(
    () => ({
      runtimeType,
      startIsoDateTime: startDate.toISOString(),
      endIsoDateTime: endDate.toISOString(),
      errorFilter: error,
      infoFilter: info,
      serviceFilter: service,
      userFilter: user,
      deep: deep,

      onlyErrors: false,
    }),
    [runtimeType, startDate, endDate, error, info, service, user, deep],
  );

  const [searchProgress, onSearch] = useOnSearch(searchParams, setLogs);

  const filteredLogs = useMemo(() => filterLogs(error, logs), [error, logs]);

  const onRowClick = getOnRowClick(setCorrelation);

  return {
    selectedLogCorrelation: correlation,
    logs,
    onSearch,
    filteredLogs,
    onRowClick,
    clearSelectedLogCorrelation: clearCorrelation,
    setSelectedLogCorrelation: setCorrelation,
    searchProgress,
  };
};
