import { ErrorThrowErrorActionRequester } from './ErrorThrowErrorActionRequesterTypes';
import { ErrorActionType } from './ErrorActionType';
import { ErrorTypeEnum, QPQError } from '../../types/ErrorTypeEnum';

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
