import { useEffect, useMemo, useState } from 'react';

export const useLogManagement = () => {
  const [logUrl, setLogUrl] = useState<string>('');
  const [loading, setLoading] = useState<any>(false);
  const [logs, setLogs] = useState<any>([]);

  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const currentDate = new Date();
    const isoDateNow = currentDate.toISOString();

    const sevenDaysAgo = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000);
    const isoDateSevenDaysAgo = sevenDaysAgo.toISOString();

    return {
      runtimeType: 'EXECUTE_STORY',
      startIsoDateTime: isoDateSevenDaysAgo,
      endIsoDateTime: isoDateNow,
      errorFilter: '',
    };
  });

  const filteredLogs = useMemo(() => {
    if (!searchParams.errorFilter) {
      return logs;
    }

    const filterWords = searchParams.errorFilter.trim().toLowerCase().split(' ');
    return logs.filter((log: any) => {
      const lowerLogError = (log.error || '').toLowerCase();
      return filterWords.every((word) => lowerLogError && lowerLogError.includes(word));
    });
  }, [searchParams.errorFilter, logs]);

  const onSearch = () => {
    setLoading(true);

    const effectiveRuntimeTypes =
      searchParams.runtimeType === 'ALL'
        ? RuntimeTypes.filter((type) => type !== 'ALL')
        : [searchParams.runtimeType];

    Promise.all(
      effectiveRuntimeTypes.flatMap((type) =>
        serviceLogEndpoints.map((x) =>
          getLogs(
            `/${x}/log/list`,
            type,
            searchParams.startIsoDateTime,
            searchParams.endIsoDateTime,
          ),
        ),
      ),
    )
      .then((allLogs: any[][]) => {
        const sortedLogs = allLogs.flat().sort((a, b) => {
          const dateA = new Date(a.startedAt);
          const dateB = new Date(b.startedAt);
          // For descending order, use dateB - dateA
          // For ascending order, use dateA - dateB
          return dateB.getTime() - dateA.getTime();
        });

        setLogs(sortedLogs);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const viewLog = (event: any) => {
    const logStory = event.row;

    const serviceEndpoint = serviceLogEndpoints.find((se: string) =>
      se.endsWith(logStory.moduleName),
    );

    setLogUrl(`/${serviceEndpoint}/log/${logStory.correlation}`);
  };

  return {
    logUrl,
    setLogUrl,
    loading,
    setLoading,
    logs,
    setLogs,
    serviceLogEndpoints,
    setServiceLogEndpoints,
    searchParams,
    setSearchParams,
    filteredLogs,
    onSearch,
    viewLog,
  };
};

export default useLogManagement;
