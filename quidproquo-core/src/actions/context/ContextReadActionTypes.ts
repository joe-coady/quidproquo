import { QpqContextIdentifier } from '../../types';
import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { ContextActionType } from './ContextActionType';

// Payload
export interface ContextReadActionPayload<T> {
  contextIdentifier: QpqContextIdentifier<T>;
}

// Action
export interface ContextReadAction<T> extends Action<ContextReadActionPayload<T>> {
  type: ContextActionType.Read;
  payload: ContextReadActionPayload<T>;
}

// Function Types
export type ContextReadActionProcessor<T> = ActionProcessor<ContextReadAction<T>, T>;
export type ContextReadActionRequester<T> = ActionRequester<ContextReadAction<T>, T>;
