import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export interface StateMachineEvent {
  type: string;
  [key: string]: any;
}

export interface StateMachineSendEventActionPayload {
  stateMachineName: string;
  id: string;
  event: StateMachineEvent;
}

export interface StateMachineSendEventAction<T> extends Action<StateMachineSendEventActionPayload> {
  type: StateMachineActionType.SendEvent;
  payload: StateMachineSendEventActionPayload;
}

export type StateMachineSendEventActionProcessor<T> = ActionProcessor<StateMachineSendEventAction<T>, T>;
export type StateMachineSendEventActionRequester<T> = ActionRequester<StateMachineSendEventAction<T>, T>;
