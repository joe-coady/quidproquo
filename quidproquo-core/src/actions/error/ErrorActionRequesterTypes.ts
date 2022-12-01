import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ErrorTypeEnum } from '../../types/ErrorTypeEnum';

// Enum
export enum ErrorActionTypeEnum {
  ThrowError = '@quidproquo-core/error/ThrowError',
}

// Payload
export interface ErrorThrowErrorActionPayload {
  errorType: ErrorTypeEnum;
  errorText: string;
  errorStack?: string;
}

// Action
export interface ErrorThrowErrorAction extends Action<ErrorThrowErrorActionPayload> {
  type: ErrorActionTypeEnum.ThrowError;
  payload: ErrorThrowErrorActionPayload;
}

// Functions
export type ErrorThrowErrorActionProcessor = ActionProcessor<ErrorThrowErrorAction, void>;
export type ErrorThrowErrorActionRequester = ActionRequester<ErrorThrowErrorAction, void>;
