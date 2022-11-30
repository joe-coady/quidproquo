import SystemActionTypeEnum from './SystemActionTypeEnum';
import { Action } from '../../types/Action';

export interface SystemBatchActionPayload {
  actions: Action[];
}

export interface SystemBatchAction extends Action {
  type: SystemActionTypeEnum.Batch;
  payload: SystemBatchActionPayload;
}

export interface SystemExecuteStoryActionPayload<T extends Array<any>> {
  type: string;
  src: string;
  runtime: string;
  params: T;
}

export interface SystemExecuteStoryAction<T extends Array<any>> extends Action {
  type: SystemActionTypeEnum.ExecuteStory;
  payload: SystemExecuteStoryActionPayload<T>;
}
