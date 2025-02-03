import { LogLog } from 'quidproquo-webserver';

import { useSearchParams } from 'react-router-dom';

export const useLogLogMananagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLogCorrelation = searchParams.get('correlation') || '';

  const setSelectedLogCorrelation = (correlation?: string) => {
    if (correlation) {
      setSearchParams({ correlation });
    } else {
      setSearchParams({});
    }
  };

  const onRowClick = ({ row }: { row: LogLog }) => {
    setSelectedLogCorrelation(row.fromCorrelation);
  };

  const clearSelectedLogCorrelation = () => {
    setSelectedLogCorrelation();
  };

  return {
    selectedLogCorrelation,
    setSelectedLogCorrelation,

    onRowClick,
    clearSelectedLogCorrelation,
  };
};
