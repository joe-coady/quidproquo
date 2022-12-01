import SystemActionTypeEnum from './SystemActionTypeEnum';
import { Action } from '../../types/Action';

export interface SystemBatchActionPayload {
  actions: Action<any>[];
}

export interface SystemBatchAction extends Action<SystemBatchActionPayload> {
  type: SystemActionTypeEnum.Batch;
}

export interface SystemExecuteStoryActionPayload<T extends Array<any>> {
  type: string;
  src: string;
  runtime: string;
  params: T;
}

export interface SystemExecuteStoryAction<T extends Array<any>>
  extends Action<SystemExecuteStoryActionPayload<T>> {
  type: SystemActionTypeEnum.ExecuteStory;
}
