import { KvsQueryOperationType } from './KvsQueryOperationType';

export type KvsQueryOperation = {
  key: string;
  operation: KvsQueryOperationType;
  valueA?: string | number | boolean;
  valueB?: string | number | boolean;
};
