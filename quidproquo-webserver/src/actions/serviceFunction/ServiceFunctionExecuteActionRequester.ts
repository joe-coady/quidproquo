import { ServiceFunctionExecuteActionRequester } from './ServiceFunctionExecuteActionTypes';
import { ServiceFunctionActionType } from './ServiceFunctionActionType';

export function* askServiceFunctionExecute<R>(
  service: string,
  functionName: string,
  ...args: any[]
): ServiceFunctionExecuteActionRequester<R> {
  return yield {
    type: ServiceFunctionActionType.Execute,
    payload: {
      functionName,
      service,
      args,
    },
  };
}
