import { useState, useEffect } from 'react';
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
import { DirectionsRunOutlined, InfoOutlined } from '@mui/icons-material';
import Pagination from '@mui/material/Pagination';
import IconButton from '@mui/material/IconButton';
import LastSeen from './components/LastSeen/LastSeen';
import LogDialog from './LogDialog';
import { getLogs } from './logic';
import { TopSection, SearchParams } from './TopSection';
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

const getColumns = (viewLog: (x: any) => void): GridColDef[] => [
  // { field: 'correlation', headerName: 'Correlation', width: 250 },
  { field: 'runtimeType', headerName: 'Type', width: 150 },
  {
    field: 'startedAt',
    headerName: 'Started at',
    width: 150,
    renderCell: (params: GridRenderCellParams) => (
      <LastSeen isoTime={params.value as Date} timeStyle="twitter" />
    ),
  },
  { field: 'generic', headerName: 'Info', width: 450 },
  { field: 'error', headerName: 'Error', width: 450 },
  {
    field: '',
    headerName: 'Execute',
    width: 140,
    renderCell: (params: GridRenderCellParams) => (
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
  const [logToView, setLogToView] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [logs, setLogs] = useState<any>([]);
  const [serviceLogEndpoints, setServiceLogEndpoints] = useState([]);
  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const currentDate = new Date();
    const isoDateNow = currentDate.toISOString();

    const sevenDaysAgo = new Date(currentDate.getTime() - 3 * 60 * 60 * 1000);
    const isoDateSevenDaysAgo = sevenDaysAgo.toISOString();

    return {
      runtimeType: 'EXECUTE_STORY',
      startIsoDateTime: isoDateSevenDaysAgo,
      endIsoDateTime: isoDateNow,
      errorFilter: '',
    };
  });

  useEffect(() => {
    setLoading(true);
    apiRequestGet('http://localhost:8080/admin/service/log/list')
      .then((newServiceLogEndpoints) => {
        setServiceLogEndpoints(newServiceLogEndpoints);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setLoading(false);
    };
  }, []);

  const onSearch = () => {
    setLoading(true);

    Promise.all(
      serviceLogEndpoints.map((x) =>
        getLogs(
          `http://localhost:8080/${x}`,
          searchParams.runtimeType,
          searchParams.startIsoDateTime,
          searchParams.endIsoDateTime,
        ),
      ),
    )
      .then((allLogs: any[][]) => {
        const sortedLogs = allLogs.flat().sort((a, b) => {
          const dateA = new Date(a.startedAt);
          const dateB = new Date(b.startedAt);
          // For descending order, use dateB - dateA
          // For ascending order, use dateA - dateB
          return dateB.getTime() - dateA.getTime();
        });

        setLogs(sortedLogs);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = getColumns((x: any) => {
    setLogToView(x);
  });

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
            Pagination: CustomPagination,
            LoadingOverlay: LinearProgress,
          }}
          columns={columns}
          initialState={initialState}
          rows={logs}
          autoPageSize={true}
          loading={loading}
        />
      </Box>
      {/* <LogDialog open={!!logToView} handleClose={() => setLogToView(null)} logFile={logToView} /> */}
    </Box>
  );
}
