import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { SystemActionType } from './SystemActionType';

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
export type SystemBatchActionProcessor<TReturn extends Array<any>> = ActionProcessor<SystemBatchAction, TReturn>;
export type SystemBatchActionRequester<TReturn extends Array<any>> = ActionRequester<SystemBatchAction | Action<any>, TReturn>;
