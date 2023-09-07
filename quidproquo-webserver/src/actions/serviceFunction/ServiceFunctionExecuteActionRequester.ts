import { ContextActionType, QpqContext } from 'quidproquo-core';

import { ServiceFunctionExecuteActionRequester } from './ServiceFunctionExecuteActionTypes';
import { ServiceFunctionActionType } from './ServiceFunctionActionType';

export function* askServiceFunctionExecute<R, T>(
  service: string,
  functionName: string,
  payload: T,
  isAsync: boolean = false
): ServiceFunctionExecuteActionRequester<R, T> {
  // Read the context so we can send it with the queue message
  const context = (yield {
    type: ContextActionType.List
  }) as QpqContext<any>;

  const result = (yield {
    type: ServiceFunctionActionType.Execute,
    payload: {
      functionName,
      service,
      payload,
      context,
      isAsync
    },
  }) as R;

  return result;
}
