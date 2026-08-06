import { AskResponse } from '../../types/StorySession';
import { createActionRequester } from '../../types/utils/createActionRequester';
import { DynamicFunctionsActionType } from './DynamicFunctionsActionType';
import { DynamicFunctionResult, DynamicFunctions } from './DynamicFunctionsExecuteActionTypes';

export const askDynamicFunctionExecuteBase = createActionRequester<unknown>()({
  actionType: DynamicFunctionsActionType.Execute,
  getPayload: (dynamicFunctionsName: string, functionName: string, args: unknown[]) => ({ dynamicFunctionsName, functionName, args }),
});

// Invoke one member of a registered dynamic-functions object (see
// defineDynamicFunctions) by name, with positional args. Type the seam by passing
// the object's type: askDynamicFunctionExecute<typeof templateEventDoc>(...) checks
// the member name, its args, and infers the (story-unwrapped) result.
export function* askDynamicFunctionExecute<
  TFunctions extends DynamicFunctions = DynamicFunctions,
  TName extends keyof TFunctions & string = keyof TFunctions & string,
>(dynamicFunctionsName: string, functionName: TName, ...args: Parameters<TFunctions[TName]>): AskResponse<DynamicFunctionResult<TFunctions[TName]>> {
  return (yield* askDynamicFunctionExecuteBase(dynamicFunctionsName, functionName, args)) as DynamicFunctionResult<TFunctions[TName]>;
}
