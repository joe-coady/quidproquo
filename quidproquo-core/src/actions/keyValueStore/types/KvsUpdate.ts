import { KvsUpdateActionType } from './KvsQueryOperationType';
import { KvsAdvancedDataType } from './KvsQueryOperation';
import { KvsAttributePath } from './KvsAttributePath';

// Type for individual update actions
export type KvsUpdateAction = {
  attributePath: KvsAttributePath;
  action: KvsUpdateActionType;
  value?: KvsAdvancedDataType;
};

// Type for multiple update actions
export type KvsUpdate = KvsUpdateAction[];
