import { Action } from 'quidproquo-core';

import { ServiceFunctionActionType } from './ServiceFunctionActionType';

// Payload
export interface ServiceFunctionExecuteActionPayload<T> {
  service: string;
  functionName: string;
  payload: T;
  isAsync: boolean;
}

// Action
export interface ServiceFunctionExecuteAction<T> extends Action<ServiceFunctionExecuteActionPayload<T>> {
  type: ServiceFunctionActionType.Execute;
  payload: ServiceFunctionExecuteActionPayload<T>;
}
