import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StateActionType } from './StateActionType';

// Payload
export type StateReadActionPayload = {
  path?: string;
};

// Action
export interface StateReadAction extends Action<StateReadActionPayload> {
  type: StateActionType.Read;
  payload: StateReadActionPayload;
}

// Function Types
export type StateReadActionProcessor<R> = ActionProcessor<StateReadAction, R>;
export type StateReadActionRequester<R> = ActionRequester<StateReadAction, R>;
