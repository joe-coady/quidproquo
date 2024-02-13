import { AskResponse, AskResponseReturnType, EitherActionResult, ErrorTypeEnum } from '../../types';

export function* askCatch<T extends AskResponse<any>>(
  storyIterator: T,
): AskResponse<EitherActionResult<AskResponseReturnType<T>>> {
  try {
    let nextResult = storyIterator.next();

    while (!nextResult.done) {
      // Add returnErrors to the action, so we can "catch" errors
      const nextInput: EitherActionResult<any> = yield {
        ...nextResult.value,
        returnErrors: true,
      };

      // If there is an error, lets just return it
      if (nextInput.success === false) {
        return nextInput;
      }

      // Now resolve the value we need
      // We need to call the busisness logic with the pure result or the either result
      // depending on if the origional action was a pure action or an either action
      nextResult = storyIterator.next(nextResult.value.returnErrors ? nextInput : nextInput.result);
    }

    // Return the successful final result of the generator
    return {
      success: true,
      result: nextResult.value,
    };
  } catch (e: any) {
    // Return the error result
    return {
      success: false,
      error: {
        errorType: ErrorTypeEnum.GenericError,
        errorText: e?.message || 'A generic error has occurred.',
        errorStack: e?.stack,
      },
    };
  }
}
