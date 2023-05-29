import { KvsQueryOperationType, KvsLogicalOperatorType } from './KvsQueryOperationType';

export type KvsCoreDataType = string | number;
export type KvsBasicDataType = KvsCoreDataType | boolean;
export type KvsListDataType = KvsBasicDataType[];

// Use an interface for the recursive data type
export interface KvsObjectDataType {
  [key: string]: KvsAdvancedDataType;
}

export type KvsAdvancedDataType = KvsBasicDataType | KvsListDataType | KvsObjectDataType;

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
