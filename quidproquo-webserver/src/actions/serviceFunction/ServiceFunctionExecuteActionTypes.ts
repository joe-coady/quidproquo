import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';
import { ServiceFunctionActionType } from './ServiceFunctionActionType';

// Payload
export interface ServiceFunctionExecuteActionPayload {
  service: string;
  functionName: string;
  args: any[];
}

// Action
export interface ServiceFunctionExecuteAction extends Action<ServiceFunctionExecuteActionPayload> {
  type: ServiceFunctionActionType.Execute;
  payload: ServiceFunctionExecuteActionPayload;
}

// Function Types
export type ServiceFunctionExecuteActionProcessor<R> = ActionProcessor<
  ServiceFunctionExecuteAction,
  R
>;
export type ServiceFunctionExecuteActionRequester<R> = ActionRequester<
  ServiceFunctionExecuteAction,
  R
>;
