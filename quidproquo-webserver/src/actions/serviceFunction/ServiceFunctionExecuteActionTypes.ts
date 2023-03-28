import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';
import { ServiceFunctionActionType } from './ServiceFunctionActionType';

// Payload
export interface ServiceFunctionExecuteActionPayload<T> {
  service: string;
  functionName: string;
  payload: T;
}

// Action
export interface ServiceFunctionExecuteAction<T>
  extends Action<ServiceFunctionExecuteActionPayload<T>> {
  type: ServiceFunctionActionType.Execute;
  payload: ServiceFunctionExecuteActionPayload<T>;
}

// Function Types
export type ServiceFunctionExecuteActionProcessor<R, T> = ActionProcessor<
  ServiceFunctionExecuteAction<T>,
  R
>;
export type ServiceFunctionExecuteActionRequester<R, T> = ActionRequester<
  ServiceFunctionExecuteAction<T>,
  R
>;
