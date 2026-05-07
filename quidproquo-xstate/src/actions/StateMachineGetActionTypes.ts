import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export interface StateMachineGetActionPayload {
  stateMachineName: string;
  id: string;
}

export interface StateMachineGetAction<T> extends Action<StateMachineGetActionPayload> {
  type: StateMachineActionType.Get;
  payload: StateMachineGetActionPayload;
}

export type StateMachineGetActionProcessor<T> = ActionProcessor<StateMachineGetAction<T>, T>;
export type StateMachineGetActionRequester<T> = ActionRequester<StateMachineGetAction<T>, T>;
