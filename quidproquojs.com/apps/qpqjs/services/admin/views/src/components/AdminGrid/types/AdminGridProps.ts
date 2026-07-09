import { DataGridProps } from 'quidproquo-web-admin';

export type AdminGridProps<T extends object> = DataGridProps<T> & {
  title?: string;
  loading?: boolean;
};
