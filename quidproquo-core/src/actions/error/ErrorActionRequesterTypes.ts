import ErrorActionTypeEnum from './ErrorActionTypeEnum';
import { Action } from '../../types/Action';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

export interface ErrorThrowErrorActionPayload {
  errorType: ErrorTypeEnum;
  errorText: string;
  errorStack: string;
}

export interface ErrorThrowErrorAction extends Action {
  type: ErrorActionTypeEnum.ThrowError;
  payload?: ErrorThrowErrorActionPayload;
}
