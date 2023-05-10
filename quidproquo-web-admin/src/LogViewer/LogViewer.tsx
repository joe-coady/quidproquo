import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';

import LogDialog from '../LogDialog';

import { TopSection } from '../TopSection';
import { useIsLoading } from '../view';
import { useLogManagement, useLogViewGridColumns } from './hooks';
import { DataGridPagination } from '../components';
import { DateCell } from '../components';

const columns: GridColDef[] = [
  { field: 'moduleName', headerName: 'Service', flex: 1 },
  { field: 'runtimeType', headerName: 'Type', flex: 1 },
  {
    field: 'startedAt',
    headerName: 'Started at',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <DateCell isoDateTime={params.value} />,
  },
  { field: 'generic', headerName: 'Info', flex: 3 },
  { field: 'error', headerName: 'Error', flex: 4 },
];

export function LogViewer() {
  const {
    selectedLogCorrelation,
    logs,
    searchParams,
    setSearchParams,
    onSearch,
    filteredLogs,
    onRowClick,
    clearSelectedLogCorrelation,
    serviceLogEndpoints,
  } = useLogManagement();
  const isLoading = useIsLoading();

  return (
    <Box sx={{ height: '100vh', width: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={2}>
        <Grid item sx={{ mb: 2, width: '100%' }}>
          <TopSection
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onSearch={onSearch}
          />
        </Grid>
      </Grid>
      <Box sx={{ flex: 1 }}>
        <DataGrid
          components={{
            Pagination: DataGridPagination,
            LoadingOverlay: LinearProgress,
          }}
          columns={columns}
          rows={filteredLogs}
          autoPageSize={true}
          loading={isLoading}
          onRowClick={onRowClick}
        />
      </Box>
      <LogDialog
        open={!!selectedLogCorrelation}
        handleClose={clearSelectedLogCorrelation}
        logCorrelation={selectedLogCorrelation}
        serviceLogEndpoints={serviceLogEndpoints}
        logStoryResultMetadatas={logs}
      />
    </Box>
  );
}
