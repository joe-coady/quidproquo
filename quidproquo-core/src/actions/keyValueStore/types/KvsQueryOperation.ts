import { KvsQueryOperationType, KvsLogicalOperatorType } from './KvsQueryOperationType';

// Type for individual query conditions
export type KvsQueryCondition = {
  key: string;
  operation: KvsQueryOperationType;
  valueA?: string | number | boolean | string[];
  valueB?: string | number | boolean;
};

// Type for logical operators
export type KvsLogicalOperator = {
  operation: KvsLogicalOperatorType;
  conditions: (KvsQueryCondition | KvsLogicalOperator)[];
};

// Type for the overall query operation
export type KvsQueryOperation = KvsQueryCondition | KvsLogicalOperator;
