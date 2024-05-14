import Box from '@mui/material/Box';
import { TopSection } from './TopSection';
import { useIsLoading } from '../view';
import { useLogSearch } from './hooks';

import { LogMetadataGrid } from './LogMetadataGrid';

export const LogSearch = () => {
  const { searchParams, setSearchParams, onSearch, logs } = useLogSearch();

  const isLoading = useIsLoading();

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, width: '100%' }}>
        <TopSection
          searchParams={searchParams}
          setSearchParams={setSearchParams}
          onSearch={onSearch}
        />
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <LogMetadataGrid logs={logs} isLoading={isLoading} />
      </Box>
    </Box>
  );
};
