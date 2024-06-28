import { DataGrid as MuiDataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export interface DataGridColumDefinitions {
  field: string;
  headerName: string;
  widthScale?: number;
  sortable?: boolean;
}

interface DataGridProps<T> {
  items: T[];
  columns: DataGridColumDefinitions[];
  onRowClick?: (item: T) => void;
}

export const DataGrid = <T,>({ items, columns, onRowClick }: DataGridProps<T>) => {
  const handleRowClick = ({ row }: { row: T }) => {
    () => {
      onRowClick?.(row);
    };
  };

  const muiColumns: GridColDef[] = columns.map((col) => ({
    field: col.field,
    headerName: col.headerName,
    flex: col.widthScale,
    sortable: col.sortable !== undefined ? col.sortable : true,
  }));

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MuiDataGrid rows={items} columns={muiColumns} onRowClick={handleRowClick} />
    </Box>
  );
};
