import { LogLog } from 'quidproquo-webserver';

import { useState } from 'react';

import { useUrlFields } from '../../../../queryParams';
import { useLogLogSearchRequest } from '../useLogLogSearchRequest/useLogLogSearchRequest';

export const useLogLogSearch = () => {
  const [logLogs, setLogLogs] = useState<LogLog[]>([]);

  const { service, startDate, endDate, msg, logLevel } = useUrlFields();

  const [searchProgress, onSearch] = useLogLogSearchRequest(
    {
      logLevelLookup: logLevel,

      startIsoDateTime: startDate.toISOString(),
      endIsoDateTime: endDate.toISOString(),

      reasonFilter: msg,
      serviceFilter: service,
    },
    setLogLogs,
  );

  return {
    logLogs,

    searchProgress,
    onSearch,
  };
};
