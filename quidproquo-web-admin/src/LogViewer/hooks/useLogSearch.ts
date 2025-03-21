import { useEffect, useState } from 'react';

import { useUrlFields } from '../../queryParams';
import { useOnSearch } from './useOnSearch';

declare global {
  interface Window {
    logs: any;
  }
}

export const useLogSearch = () => {
  const { runtimeType, service, startDate, endDate, user, info, deep, error } = useUrlFields();

  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    window.logs = logs;
  }, [logs]);

  useEffect(() => {
    console.log('logs attached to window, try: viewLog(logs[0])');
  }, []);

  const [searchProgress, onSearch] = useOnSearch(
    {
      runtimeType,
      startIsoDateTime: startDate.toISOString(),
      endIsoDateTime: endDate.toISOString(),
      errorFilter: error,
      infoFilter: info,
      serviceFilter: service,
      userFilter: user,
      deep: deep,
      onlyErrors: false,
    },
    setLogs,
  );

  return {
    logs,
    searchProgress,
    onSearch,
  };
};
