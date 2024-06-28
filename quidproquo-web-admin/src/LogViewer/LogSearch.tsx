import { TopSection } from './TopSection';
import { useIsLoading } from '../view';
import { useLogSearch } from './hooks';

import { LogMetadataGrid } from './LogMetadataGrid';
import { TabViewBox } from '../components';

export const LogSearch = () => {
  const { searchParams, setSearchParams, onSearch, logs } = useLogSearch();
  const isLoading = useIsLoading();

  return (
    <TabViewBox
      header={() => <TopSection searchParams={searchParams} setSearchParams={setSearchParams} onSearch={onSearch} />}
      body={() => <LogMetadataGrid logs={logs} isLoading={isLoading} />}
    />
  );
};
