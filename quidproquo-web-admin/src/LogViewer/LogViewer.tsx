import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, GridRenderCellParams, GridColDef } from '@mui/x-data-grid';
import { Tabs, Tab } from '@mui/material';

import LogDialog from './LogDialog';

import { TopSection } from './TopSection';
import { useIsLoading } from '../view';
import { useLogManagement } from './hooks';
import { DataGridPagination, DateCell } from '../components';
import { Dashboard } from './Dashboard';

const formatTime = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;

  const sec = ms / 1000;
  if (sec < 60) return `${sec.toFixed(1)}s`;

  const min = sec / 60;
  if (min < 60) return `${min.toFixed(1)}m`;

  const hr = min / 60;
  if (hr < 24) return `${hr.toFixed(1)}h`;

  const day = hr / 24;
  return `${day.toFixed(1)}d`;
};

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
  {
    field: 'executionTimeMs',
    headerName: 'executionTime',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <>{formatTime(params.value)}</>,
    sortComparator: (v1, v2) => Number(v1) - Number(v2),
  },
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
    setSelectedLogCorrelation,
    searchProgress,
  } = useLogManagement();
  const isLoading = useIsLoading();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

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
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {selectedTab === 0 && (
          <DataGrid
            components={{
              Pagination: DataGridPagination,
              LoadingOverlay: () => <LinearProgress variant="determinate" value={searchProgress} />,
            }}
            columns={columns}
            rows={filteredLogs.map((item) => ({ ...item, id: item.correlation }))}
            autoPageSize
            loading={isLoading}
            onRowClick={onRowClick}
          />
        )}
        {selectedTab === 1 && <Dashboard logs={logs} searchParams={searchParams} />}
      </Box>
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Logs" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>
      <LogDialog
        open={!!selectedLogCorrelation}
        handleClose={clearSelectedLogCorrelation}
        logCorrelation={selectedLogCorrelation}
        storyResultMetadatas={logs}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
      />
    </Box>
  );
}
