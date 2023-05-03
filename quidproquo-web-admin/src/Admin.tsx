import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import {
  DataGrid,
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { DirectionsRunOutlined, InfoOutlined } from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';
import IconButton from '@mui/material/IconButton';
import LastSeen from './components/LastSeen/LastSeen';
import LogDialog from './LogDialog';
import { apiRequestGet } from './logic/apiRequest';

function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Pagination
      color="primary"
      count={pageCount}
      page={page + 1}
      onChange={(event, value) => apiRef.current.setPage(value - 1)}
    />
  );
}

const getColumns = (viewLog: (x: any) => void) => [
  // { field: 'id', hide: false },
  // { field: 'service', headerName: 'service', width: 150 },
  // { field: 'type', headerName: 'type', width: 150 },
  // {
  //   field: 'createdDateTime',
  //   headerName: 'when',
  //   width: 250,
  //   renderCell: (params: GridRenderCellParams<Date>) => (
  //     <LastSeen isoTime={params.value} timeStyle="twitter" />
  //   ),
  // },
  // { field: 'path', headerName: 'route', width: 180, editable: false },
  // { field: 'src', headerName: 'source', width: 180, editable: false },
  // { field: 'runtime', headerName: 'method', width: 150, editable: false },
  { field: 'filePath', headerName: 'filePath', width: 250 },
  { field: 'runtimeType', headerName: 'runtimeType', width: 250 },
  {
    field: 'startedAt',
    headerName: 'startedAt',
    width: 250,
    renderCell: (params: GridRenderCellParams<Date>) => (
      <LastSeen isoTime={params.value} timeStyle="twitter" />
    ),
  },
  {
    field: 'generic',
    headerName: 'Execute',
    width: 140,
    renderCell: (params: GridRenderCellParams<Date>) => (
      <>
        <IconButton color="primary" aria-label="Run Logs">
          <DirectionsRunOutlined />
        </IconButton>
        <IconButton color="primary" aria-label="upload picture" onClick={() => viewLog(params.row)}>
          <InfoOutlined />
        </IconButton>
      </>
    ),
  },
];

const initialState = {
  columns: {
    columnVisibilityModel: {
      id: false,
    },
  },
};

export default function CustomPaginationGrid() {
  const [logs, setLogs] = useState([]);
  const [logToView, setLogToView] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);

  const getLogs = async () => {
    const newLogs = await apiRequestGet('/api/card/log/list');
    setLogs(newLogs.map((x: any) => ({ ...x, id: x.filePath })));
  };

  useEffect(() => {
    setLoading(true);
    getLogs().then(() => {
      setLoading(false);
    });

    return () => {
      setLoading(false);
    };
  }, []);

  const columns = getColumns((x: any) => {
    setLogToView(x);
  });

  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <DataGrid
        components={{
          Pagination: CustomPagination,
          LoadingOverlay: LinearProgress,
        }}
        columns={columns}
        initialState={initialState}
        rows={logs}
        autoPageSize={true}
        loading={loading}
      />
      <LogDialog open={!!logToView} handleClose={() => setLogToView(null)} logFile={logToView} />
    </Box>
  );
}
