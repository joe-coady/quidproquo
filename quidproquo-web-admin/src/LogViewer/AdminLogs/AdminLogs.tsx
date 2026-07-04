import { TabViewBox } from '../../components/TabViewBox';
import { useIsLoading } from '../../view/Loading/hooks/useIsLoading';
import { AdminLogGrid } from './AdminLogGrid/AdminLogGrid';
import { AdminLogSearchBar } from './AdminLogSearchBar/AdminLogSearchBar';
import { useLogLogSearch } from './hooks';

export const AdminLogs = () => {
  const { logLogs, searchProgress, onSearch } = useLogLogSearch();
  const isLoading = useIsLoading();

  return (
    <TabViewBox
      body={() => <AdminLogGrid isLoading={isLoading} logs={logLogs} searchProgress={searchProgress} />}
      header={() => <AdminLogSearchBar onSearch={onSearch} />}
    />
  );
};
