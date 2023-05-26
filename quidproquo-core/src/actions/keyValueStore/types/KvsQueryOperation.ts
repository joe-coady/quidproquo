import { KvsQueryOperationType, KvsLogicalOperatorType } from './KvsQueryOperationType';

export type KvsCoreDataType = string | number;
export type KvsBasicDataType = KvsCoreDataType | boolean;
export type KvsAdvancedDataType = KvsBasicDataType | string[];

// Type for individual query conditions
export type KvsQueryCondition = {
  key: string;
  operation: KvsQueryOperationType;
  valueA?: KvsAdvancedDataType;
  valueB?: KvsBasicDataType;
};

// Type for logical operators
export type KvsLogicalOperator = {
  operation: KvsLogicalOperatorType;
  conditions: (KvsQueryCondition | KvsLogicalOperator)[];
};

// Type for the overall query operation
export type KvsQueryOperation = KvsQueryCondition | KvsLogicalOperator;
