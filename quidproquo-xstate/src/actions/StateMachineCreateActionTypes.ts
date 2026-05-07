import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export interface StateMachineCreateActionPayload<T> {
  stateMachineName: string;
  id: string;
  item: T;
}

export interface StateMachineCreateAction<T> extends Action<StateMachineCreateActionPayload<T>> {
  type: StateMachineActionType.Create;
  payload: StateMachineCreateActionPayload<T>;
}

export type StateMachineCreateActionProcessor<T> = ActionProcessor<StateMachineCreateAction<T>, T>;
export type StateMachineCreateActionRequester<T> = ActionRequester<StateMachineCreateAction<T>, T>;
