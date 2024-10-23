import { ErrorTypeEnum, QPQError } from '../../types/ErrorTypeEnum';
import { ErrorActionType } from './ErrorActionType';
import { ErrorThrowErrorActionRequester } from './ErrorThrowErrorActionRequesterTypes';

export function* askThrowError<T>(
  errorType: QPQError['errorType'],
  errorText: QPQError['errorText'],
  errorStack?: QPQError['errorStack'],
): ErrorThrowErrorActionRequester<T> {
  return (yield {
    type: ErrorActionType.ThrowError,
    payload: { errorType, errorText, errorStack },
  }) as T;
}
