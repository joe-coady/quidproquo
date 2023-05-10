import { useMemo } from 'react';
import { GridColDef } from '@mui/x-data-grid';

export const useLogViewGridColumns = (
  getColumns: (viewLog: (x: any) => void) => GridColDef[],
  onRowClick: (event: any) => void,
) => {
  const columns = useMemo(() => getColumns(onRowClick), [onRowClick]);
  return columns;
};
