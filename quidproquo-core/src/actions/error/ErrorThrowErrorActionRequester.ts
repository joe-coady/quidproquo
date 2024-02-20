import { ErrorThrowErrorActionRequester } from './ErrorThrowErrorActionRequesterTypes';
import { ErrorActionType } from './ErrorActionType';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

export function* askThrowError<T extends any>(
  errorType: ErrorTypeEnum,
  errorText: string,
  errorStack?: string,
): ErrorThrowErrorActionRequester<T> {
  return (yield {
    type: ErrorActionType.ThrowError,
    payload: { errorType, errorText, errorStack },
  }) as T;
}
