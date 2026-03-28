import { InlineFunctionActionType } from './InlineFunctionActionType';
import { InlineFunctionExecuteActionRequester } from './InlineFunctionExecuteActionTypes';

export function* askInlineFunctionExecute<R, T>(
  functionName: string,
  payload: T,
): InlineFunctionExecuteActionRequester<R, T> {
  return yield {
    type: InlineFunctionActionType.Execute,
    payload: {
      functionName,
      payload,
    },
  };
}
