import { AskResponse, AskResponseReturnType, EitherActionResult, ErrorTypeEnum } from '../../types';

export function* askCatch<T extends AskResponse<any>>(storyIterator: T): AskResponse<EitherActionResult<AskResponseReturnType<T>>> {
  try {
    let nextResult = storyIterator.next();

    while (!nextResult.done) {
      // Add returnErrors to the action, so we can "catch" errors
      const nextInput: EitherActionResult<any> = yield {
        ...nextResult.value,
        returnErrors: true,
      };

      // If there is an error, and no child askCatch, return the error
      if (nextInput.success === false && !nextResult.value.returnErrors) {
        return nextInput;
      }

      // Continue executing the story
      // If there is a child askCatch, then pass down the either result
      // otherwise just pass down the result as we would expect.
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
