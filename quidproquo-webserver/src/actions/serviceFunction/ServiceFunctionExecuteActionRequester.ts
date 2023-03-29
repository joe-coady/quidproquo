import { ServiceFunctionExecuteActionRequester } from './ServiceFunctionExecuteActionTypes';
import { ServiceFunctionActionType } from './ServiceFunctionActionType';

export function* askServiceFunctionExecute<R, T>(
  service: string,
  functionName: string,
  payload: T,
): ServiceFunctionExecuteActionRequester<R, T> {
  return yield {
    type: ServiceFunctionActionType.Execute,
    payload: {
      functionName,
      service,
      payload,
    },
  };
}
