import { DataGrid as MuiDataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export type DataGridColumDefinitions<T extends object> = {
  headerName: string;
  widthScale?: number;
  sortable?: boolean;
} & ({ field: keyof T } | { valueGetter: (i: T) => any });

export interface DataGridProps<T extends object> {
  items: T[];
  columns: DataGridColumDefinitions<T>[];
  onRowClick?: (row: T) => void;
}

export const DataGrid = <T extends object>({ items, columns, onRowClick }: DataGridProps<T>) => {
  const handleRowClick = ({ row }: { row: T }) => {
    onRowClick?.(row);
  };

  const muiColumns: GridColDef[] = columns.map((col, index) => ({
    headerName: col.headerName,
    flex: col.widthScale,
    sortable: col.sortable !== undefined ? col.sortable : true,

    field: 'field' in col ? (col.field as string) : `_dynamicField${index}`,
    valueGetter: 'valueGetter' in col ? (params: GridValueGetterParams) => col.valueGetter!(params.row as T) : undefined,
  }));

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MuiDataGrid rows={items} columns={muiColumns} onRowClick={handleRowClick} />
    </Box>
  );
};
