import { ErrorActionType } from './ErrorActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

// Payload
export interface ErrorThrowErrorActionPayload {
  errorType: ErrorTypeEnum;
  errorText: string;
  errorStack?: string;
}

// Action
export interface ErrorThrowErrorAction extends Action<ErrorThrowErrorActionPayload> {
  type: ErrorActionType.ThrowError;
  payload: ErrorThrowErrorActionPayload;
}

// Functions
export type ErrorThrowErrorActionProcessor<T = any> = ActionProcessor<ErrorThrowErrorAction, T>;
export type ErrorThrowErrorActionRequester<T = any> = ActionRequester<ErrorThrowErrorAction, T>;
