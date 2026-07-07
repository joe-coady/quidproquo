import { TabViewBox } from '../components/TabViewBox';
import { useIsLoading } from '../view/Loading/hooks/useIsLoading';
import { useLogSearch } from './hooks';
import { LogMetadataGrid } from './LogMetadataGrid';
import { TopSection } from './TopSection';

export const LogSearch = () => {
  const { onSearch, logs } = useLogSearch();
  const isLoading = useIsLoading();

  return <TabViewBox body={() => <LogMetadataGrid isLoading={isLoading} logs={logs} />} header={() => <TopSection onSearch={onSearch} />} />;
};
