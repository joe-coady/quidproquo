import { SystemActionType } from './SystemActionType';
import { Action, ActionRequester, ActionProcessor } from '../../types/Action';

// Payload
export interface SystemBatchActionPayload {
  actions: Action<any>[];
}

// Action
export interface SystemBatchAction extends Action<SystemBatchActionPayload> {
  type: SystemActionType.Batch;
  payload: SystemBatchActionPayload;
}

// Functions
export type SystemBatchActionProcessor<TReturn extends Array<any>> = ActionProcessor<
  SystemBatchAction,
  TReturn
>;
export type SystemBatchActionRequester<TReturn extends Array<any>> = ActionRequester<
  SystemBatchAction,
  TReturn
>;
