import { KvsAttributePath } from './KvsAttributePath';
import { KvsAdvancedDataType } from './KvsQueryOperation';
import { KvsUpdateActionType } from './KvsQueryOperationType';

// Type for individual update actions
export type KvsUpdateAction = {
  attributePath: KvsAttributePath;
  action: KvsUpdateActionType;
  value?: KvsAdvancedDataType;
};

// Type for multiple update actions
export type KvsUpdate = KvsUpdateAction[];
