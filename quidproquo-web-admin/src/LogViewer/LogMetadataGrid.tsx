import LinearProgress from '@mui/material/LinearProgress';
import {
  DataGrid,
  GridRenderCellParams,
  GridColDef,
  GridRowClassNameParams,
} from '@mui/x-data-grid';
import LogDialog from './LogDialog';
import { useLogManagement } from './hooks';
import { DataGridPagination, DateCell } from '../components';
import { LogMetadata } from 'quidproquo-webserver';

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
  {
    field: 'startedAt',
    headerName: 'Started at',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <DateCell isoDateTime={params.value} />,
  },
  { field: 'moduleName', headerName: 'Service', flex: 1 },
  { field: 'runtimeType', headerName: 'Type', flex: 1 },
  { field: 'generic', headerName: 'Info', flex: 3 },
  { field: 'error', headerName: 'Error', flex: 4 },
  { field: 'userInfo', headerName: 'User', flex: 1.5 },
  {
    field: 'executionTimeMs',
    headerName: 'Execution Time',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <>{formatTime(params.value)}</>,
    sortComparator: (v1, v2) => Number(v1) - Number(v2),
  },
];

type LogMetadataGridProps = {
  logs: LogMetadata[];
  isLoading: boolean;
};

export const LogMetadataGrid = ({ logs, isLoading }: LogMetadataGridProps) => {
  const {
    selectedLogCorrelation,
    onRowClick,
    clearSelectedLogCorrelation,
    setSelectedLogCorrelation,
    searchProgress,
  } = useLogManagement();

  const getRowClassName = (params: GridRowClassNameParams) => {
    return params.row.checked ? 'greenRow' : '';
  };

  return (
    <>
      <style>
        {`
          .greenRow {
            background-color: #eaffea;
          }
        `}
      </style>
      <DataGrid
        components={{
          Pagination: DataGridPagination,
          LoadingOverlay: () => <LinearProgress variant="determinate" value={searchProgress} />,
        }}
        columns={columns}
        rows={logs.map((log) => ({ ...log, id: log.correlation }))}
        autoPageSize
        loading={isLoading}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
      />
      <LogDialog
        open={!!selectedLogCorrelation}
        handleClose={clearSelectedLogCorrelation}
        logCorrelation={selectedLogCorrelation}
        storyResultMetadatas={logs}
        setSelectedLogCorrelation={setSelectedLogCorrelation}
      />
    </>
  );
};
