import ErrorActionTypeEnum from './ErrorActionTypeEnum';
import { ErrorThrowErrorAction } from './ErrorActionRequesterTypes';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

export function* askThrowError(
  errorType: ErrorTypeEnum,
  errorText: string,
  errorStack: string,
): Generator<ErrorThrowErrorAction, void, void> {
  yield {
    type: ErrorActionTypeEnum.ThrowError,
    payload: { errorType, errorText, errorStack },
  };
}
