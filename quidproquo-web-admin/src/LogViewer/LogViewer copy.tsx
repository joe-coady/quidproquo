import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
  GridRenderCellParams,
  GridColDef,
} from '@mui/x-data-grid';

import Typography from '@mui/material/Typography';
import LastSeen from '../components/LastSeen/LastSeen';
import LogDialog from '../LogDialog';

import { TopSection } from '../TopSection';
import { useIsLoading } from '../view';
import { useLogManagement, useLogViewGridColumns } from './hooks';
import { DataGridPagination } from '../components';

const getColumns = (viewLog: (x: any) => void): GridColDef[] => [
  // { field: 'correlation', headerName: 'correlation', flex: 3 },
  // { field: 'fromCorrelation', headerName: 'fromCorrelation', flex: 3 },
  { field: 'moduleName', headerName: 'Service', flex: 1 },
  { field: 'runtimeType', headerName: 'Type', flex: 1 },
  {
    field: 'startedAt',
    headerName: 'Started at',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => {
      const isoTime = params.value as Date;
      const date = new Date(isoTime);
      const formattedTime = date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const formattedDate = date.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });

      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" component="span">
            {formattedDate} {formattedTime}
          </Typography>
          <LastSeen isoTime={isoTime} timeStyle="twitter" />
        </div>
      );
    },
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
  const columns = useLogViewGridColumns(getColumns, onRowClick);

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
