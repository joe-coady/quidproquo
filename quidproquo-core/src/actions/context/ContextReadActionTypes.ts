import { QpqContextIdentifier } from '../../types';
import { Action } from '../../types/Action';
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
