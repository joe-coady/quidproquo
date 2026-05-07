import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export interface StateMachineGetStateActionPayload {
  stateMachineName: string;
  id: string;
}

export interface StateMachineStateInfo {
  value: string;
  done: boolean;
}

export interface StateMachineGetStateAction extends Action<StateMachineGetStateActionPayload> {
  type: StateMachineActionType.GetState;
  payload: StateMachineGetStateActionPayload;
}

export type StateMachineGetStateActionProcessor = ActionProcessor<StateMachineGetStateAction, StateMachineStateInfo>;
export type StateMachineGetStateActionRequester = ActionRequester<StateMachineGetStateAction, StateMachineStateInfo>;
