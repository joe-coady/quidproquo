import { LogLevelEnum } from 'quidproquo-core';
import { LogLog } from 'quidproquo-webserver';

import LinearProgress from '@mui/material/LinearProgress';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowClassNameParams } from '@mui/x-data-grid';

import { DataGridPagination, DateCell } from '../../../components';
import { LogDialog } from '../../LogDialog';
import { useLogLogMananagement } from '../hooks';

const columns: GridColDef[] = [
  {
    field: 'type',
    headerName: 'Type',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <div>{LogLevelEnum[params.value]}</div>,
  },
  {
    field: 'module',
    headerName: 'Service',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <div>{params.value || 'unknown'}</div>,
  },
  {
    field: 'timestamp',
    headerName: 'When',
    flex: 1,
    renderCell: (params: GridRenderCellParams) => <DateCell isoDateTime={params.value} />,
  },
  { field: 'reason', headerName: 'Message', flex: 8 },
];

type AdminLogGridProps = {
  logs: LogLog[];
  isLoading: boolean;
  searchProgress: number;
};

export const AdminLogGrid = ({ logs, isLoading, searchProgress }: AdminLogGridProps) => {
  const { selectedLogCorrelation, setSelectedLogCorrelation, onRowClick, clearSelectedLogCorrelation } = useLogLogMananagement();

  const getRowClassName = (params: GridRowClassNameParams) => {
    switch (params.row.type) {
      case LogLevelEnum.Fatal:
        return 'fatalRow';
      case LogLevelEnum.Error:
        return 'errorRow';
      case LogLevelEnum.Warn:
        return 'warnRow';
      case LogLevelEnum.Info:
        return 'infoRow';
      case LogLevelEnum.Debug:
        return 'debugRow';
      case LogLevelEnum.Trace:
        return 'traceRow';
      default:
        return '';
    }
  };

  return (
    <>
      <style>
        {`
  .fatalRow {
    background-color: #8B0000 !important; /* Dark Red */
    color: #fff;
  }
  .fatalRow:hover {
    background-color: #B22222 !important; /* FireBrick */
    color: #fff;
  }

  .errorRow {
    background-color: #FF4C4C !important; /* Red-ish */
    color: #fff;
  }
  .errorRow:hover {
    background-color: #FF6666 !important; /* Lighter red for hover */
    color: #fff;
  }

  .warnRow {
    background-color: #FFD700 !important; /* Gold */
    color: #000;
  }
  .warnRow:hover {
    background-color: #FFED85 !important; /* Lighter/gentler yellow */
    color: #000;
  }

  .infoRow {
    background-color: #ADD8E6 !important; /* Light Blue (SkyBlue) */
    color: #000;
  }
  .infoRow:hover {
    background-color: #C4E4F2 !important; /* Slightly lighter blue */
    color: #000;
  }

  .debugRow {
    background-color: #E0E0E0 !important; /* Light Gray */
    color: #000;
  }
  .debugRow:hover {
    background-color: #D0D0D0 !important; /* Slightly darker gray */
    color: #000;
  }

  .traceRow {
    background-color: #F3F3F3 !important; /* Very Light Gray */
    color: #000;
  }
  .traceRow:hover {
    background-color: #E3E3E3 !important; 
    color: #000;
  }
`}
      </style>
      <DataGrid
        components={{
          Pagination: DataGridPagination,
          LoadingOverlay: () => <LinearProgress variant="determinate" value={searchProgress} />,
        }}
        columns={columns}
        rows={logs.map((log, i) => ({ ...log, id: `${i}` }))}
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
