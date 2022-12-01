import { ActionProcessorResult } from '../types/Action';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';

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
