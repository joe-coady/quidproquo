import { TabViewBox } from '../../components';
import { useIsLoading } from '../../view';
import { AdminLogGrid } from './AdminLogGrid';
import { AdminLogSearchBar } from './AdminLogSearchBar';
import { useLogLogSearch } from './hooks';

export const AdminLogs = () => {
  const { logLogs, searchParams, setSearchParams, searchProgress, onSearch } = useLogLogSearch();
  const isLoading = useIsLoading();

  return (
    <TabViewBox
      header={() => <AdminLogSearchBar onSearch={onSearch} searchParams={searchParams} setLogLogSearchParams={setSearchParams} />}
      body={() => <AdminLogGrid logs={logLogs} isLoading={isLoading} searchProgress={searchProgress} />}
    />
  );
};
