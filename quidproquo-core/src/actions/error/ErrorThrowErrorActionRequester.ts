import { ErrorThrowErrorActionRequester } from './ErrorThrowErrorActionRequesterTypes';
import { ErrorActionType } from './ErrorActionType';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

export function* askThrowError(
  errorType: ErrorTypeEnum,
  errorText: string,
  errorStack?: string,
): ErrorThrowErrorActionRequester {
  yield {
    type: ErrorActionType.ThrowError,
    payload: { errorType, errorText, errorStack },
  };
}
