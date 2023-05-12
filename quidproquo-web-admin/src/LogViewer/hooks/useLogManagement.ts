import { useState, useMemo } from 'react';
import { SearchParams } from '../types';

import { useServiceLogEndpoints } from './useServiceLogEndpoints';
import { useOnSearch } from './useOnSearch';
import { filterLogs, getOnRowClick } from '../logic';

export const useLogManagement = () => {
  const serviceLogEndpoints = useServiceLogEndpoints();
  const [selectedLogCorrelation, setSelectedLogCorrelation] = useState<string>('');
  const [logs, setLogs] = useState<any>([]);

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

  const onSearch = useOnSearch(searchParams, serviceLogEndpoints, setLogs);

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
    serviceLogEndpoints,
  };
};
