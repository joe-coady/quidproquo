import { DynamicFunctionsActionType } from './DynamicFunctionsActionType';
import { DynamicFunctionResult, DynamicFunctions, DynamicFunctionsExecuteActionRequester } from './DynamicFunctionsExecuteActionTypes';

// Invoke one member of a registered dynamic-functions object (see
// defineDynamicFunctions) by name, with positional args. Type the seam by passing
// the object's type: askDynamicFunctionExecute<typeof templateEventDoc>(...) checks
// the member name, its args, and infers the (story-unwrapped) result.
export function* askDynamicFunctionExecute<
  TFunctions extends DynamicFunctions = DynamicFunctions,
  TName extends keyof TFunctions & string = keyof TFunctions & string,
>(
  dynamicFunctionsName: string,
  functionName: TName,
  ...args: Parameters<TFunctions[TName]>
): DynamicFunctionsExecuteActionRequester<DynamicFunctionResult<TFunctions[TName]>> {
  return yield {
    type: DynamicFunctionsActionType.Execute,
    payload: {
      dynamicFunctionsName,
      functionName,
      args,
    },
  };
}
