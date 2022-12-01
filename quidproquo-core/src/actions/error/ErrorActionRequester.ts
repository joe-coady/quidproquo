import { ErrorThrowErrorActionRequester, ErrorActionTypeEnum } from './ErrorActionRequesterTypes';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

export function* askThrowError(
  errorType: ErrorTypeEnum,
  errorText: string,
  errorStack: string,
): ErrorThrowErrorActionRequester {
  yield {
    type: ErrorActionTypeEnum.ThrowError,
    payload: { errorType, errorText, errorStack },
  };
}
