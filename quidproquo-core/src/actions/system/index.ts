import { SystemBatchActionRequesterTypeMap } from './SystemBatchActionTypes';
import { SystemExecuteStoryActionRequesterTypeMap } from './SystemExecuteStoryActionTypes';

export * from './SystemActionType';

export * from './SystemBatchActionRequester';
export * from './SystemBatchActionTypes';

export * from './SystemExecuteStoryActionRequester';
export * from './SystemExecuteStoryActionTypes';

export type SystemActionRequesterTypeMap = SystemBatchActionRequesterTypeMap<Array<any>> & SystemExecuteStoryActionRequesterTypeMap<Array<any>, any>;
