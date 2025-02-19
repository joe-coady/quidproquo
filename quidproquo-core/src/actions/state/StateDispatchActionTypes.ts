import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
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

// Function Types
export type StateDispatchActionProcessor<T> = ActionProcessor<StateDispatchAction<T>, void>;
export type StateDispatchActionRequester<T> = ActionRequester<StateDispatchAction<T>, void>;
