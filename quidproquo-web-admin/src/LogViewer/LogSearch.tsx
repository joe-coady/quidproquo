import { TabViewBox } from '../components';
import { useIsLoading } from '../view';
import { useLogSearch } from './hooks';
import { LogMetadataGrid } from './LogMetadataGrid';
import { TopSection } from './TopSection';

export const LogSearch = () => {
  const { onSearch, logs } = useLogSearch();
  const isLoading = useIsLoading();

  return <TabViewBox header={() => <TopSection onSearch={onSearch} />} body={() => <LogMetadataGrid logs={logs} isLoading={isLoading} />} />;
};
