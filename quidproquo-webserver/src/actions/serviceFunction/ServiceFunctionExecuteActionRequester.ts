import { ServiceFunctionActionType } from './ServiceFunctionActionType';
import { ServiceFunctionExecuteActionRequester } from './ServiceFunctionExecuteActionTypes';

export function* askServiceFunctionExecute<R, T>(
  service: string,
  functionName: string,
  payload: T,
  isAsync: boolean = false,
): ServiceFunctionExecuteActionRequester<R, T> {
  const result = (yield {
    type: ServiceFunctionActionType.Execute,
    payload: {
      functionName,
      service,
      payload,
      isAsync,
    },
  }) as R;

  return result;
}
