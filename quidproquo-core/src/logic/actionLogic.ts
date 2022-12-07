import { ActionProcessorResult } from '../types/Action';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';
import { QPQError } from '../types/ErrorTypeEnum';

export const actionResultError = (
  errorType: ErrorTypeEnum,
  errorText: string,
  errorStack?: string,
): ActionProcessorResult<any> => {
  return [undefined, { errorType, errorText, errorStack }];
};

export const actionResult = <T>(result: T): ActionProcessorResult<T> => {
  return [result];
};

export const isErroredActionResult = <T>(actionResult: ActionProcessorResult<T>): boolean => {
  return !actionResult || !!actionResult[1];
};

export const resolveActionResult = <T>(actionResult: ActionProcessorResult<T>) => {
  return actionResult[0];
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
