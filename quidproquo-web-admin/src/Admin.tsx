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
import Typography from '@mui/material/Typography';
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
  // {
  //   field: '',
  //   headerName: 'Execute',
  //   flex: 1,
  //   renderCell: (params: GridRenderCellParams) => (
  //     <IconButton color="primary" aria-label="upload picture" onClick={() => viewLog(params.row)}>
  //       <InfoOutlined />
  //     </IconButton>
  //   ),
  // },
];

const initialState = {
  columns: {
    columnVisibilityModel: {
      id: false,
    },
  },
};

export default function CustomPaginationGrid() {
  const [logUrl, setLogUrl] = useState<string>('');
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
    apiRequestGet('/admin/service/log/list')
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
          `/${x}/log/list`,
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

  const viewLog = (event: any) => {
    const logStory = event.row;

    const serviceEndpoint = serviceLogEndpoints.find(
      (se: string) => se.indexOf(logStory.moduleName) >= 0,
    );

    setLogUrl(`${serviceEndpoint}/log/${logStory.correlation}`);
  };

  const columns = getColumns(viewLog);

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
          onRowClick={viewLog}
        />
      </Box>
      <LogDialog open={!!logUrl} handleClose={() => setLogUrl('')} logUrl={logUrl} />
    </Box>
  );
}
