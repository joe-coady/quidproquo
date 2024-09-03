import { ActionProcessorResult, EitherActionResult } from '../types/Action';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';
import { QPQError } from '../types/ErrorTypeEnum';

export const getSuccessfulEitherActionResult = <T>(result: T): EitherActionResult<T> => ({
  success: true,
  result,
});

export const getUnsuccessfulEitherActionResult = (error: QPQError): EitherActionResult<any> => ({
  success: false,
  error: error,
});

export const actionResultError = (errorType: ErrorTypeEnum | string, errorText: string, errorStack?: string): ActionProcessorResult<any> => {
  return [undefined, { errorType, errorText, errorStack }];
};

export const actionResult = <T>(result: T): ActionProcessorResult<T> => {
  return [result];
};

export const isErroredActionResult = <T>(actionResult: ActionProcessorResult<T>): boolean => {
  return !actionResult || !!actionResult[1];
};

export const resolveActionResult = <T>(actionResult: ActionProcessorResult<T>) => {
  // We say that it has to have a value, otherwise don't call this function
  // use isErroredActionResult to check
  return actionResult[0]!;
};

export const resolveActionResultError = <T>(actionResult: ActionProcessorResult<T>): QPQError => {
  if (!actionResult) {
    return {
      errorText: 'no idea' + JSON.stringify(actionResult),
      errorType: ErrorTypeEnum.GenericError,
    };
  }

  return actionResult[1] as QPQError;
};

type ErrorMap = { [key: string]: (error: Error) => ActionProcessorResult<any> };

export const actionResultErrorFromCaughtError = (error: unknown, errorMap: ErrorMap): ReturnType<typeof actionResultError> => {
  if (error instanceof Error) {
    const errorName = (error as any).name;

    console.log('actionResultErrorFromCaughtError:', error, error.stack);

    if (errorMap[errorName]) {
      return errorMap[errorName](error);
    }

    console.log(`Error: ${errorName}`);
    return actionResultError(ErrorTypeEnum.GenericError, 'An unexpected error occurred.');
  }

  console.log('Caught non-error:', error);

  return actionResultError(ErrorTypeEnum.GenericError, 'An unknown error occurred.');
};
