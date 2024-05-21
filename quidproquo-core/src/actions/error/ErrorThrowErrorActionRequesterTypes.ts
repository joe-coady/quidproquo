import { ErrorActionType } from './ErrorActionType';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QPQError } from '../../types/ErrorTypeEnum';

// Payload
export type ErrorThrowErrorActionPayload = QPQError;

// Action
export interface ErrorThrowErrorAction extends Action<ErrorThrowErrorActionPayload> {
  type: ErrorActionType.ThrowError;
  payload: ErrorThrowErrorActionPayload;
}

// Functions
export type ErrorThrowErrorActionProcessor<T = any> = ActionProcessor<ErrorThrowErrorAction, T>;
export type ErrorThrowErrorActionRequester<T = any> = ActionRequester<ErrorThrowErrorAction, T>;
