import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export type StateMachineGetActionPayload = {
  stateMachineName: string;
  id: string;
};

// T is the caller's entity shape; it only affects the processor/requester
// return type, but stays on the action so all four generics line up.
export interface StateMachineGetAction<T> extends Action<StateMachineGetActionPayload> {
  type: StateMachineActionType.Get;
  payload: StateMachineGetActionPayload;
}

export type StateMachineGetActionProcessor<T> = ActionProcessor<StateMachineGetAction<T>, T>;
export type StateMachineGetActionRequester<T> = ActionRequester<StateMachineGetAction<T>, T>;
