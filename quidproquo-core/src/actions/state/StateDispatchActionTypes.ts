import { Action } from '../../types/Action';
import { StateActionType } from './StateActionType';

// Payload
export type StateDispatchActionPayload<T> = {
  action: T;
};

// Action
export interface StateDispatchAction<T> extends Action<StateDispatchActionPayload<T>> {
  type: StateActionType.Dispatch;
  payload: StateDispatchActionPayload<T>;
}
