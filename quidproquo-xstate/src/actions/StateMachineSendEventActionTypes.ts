import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

/** An event sent to a state machine; extra fields ride along to guard and action stories. */
export type StateMachineEvent = {
  type: string;
  [key: string]: unknown;
};

export type StateMachineSendEventActionPayload = {
  stateMachineName: string;
  id: string;
  event: StateMachineEvent;
};

// T is the caller's entity shape; it only affects the processor/requester
// return type, but stays on the action so all four generics line up.
export interface StateMachineSendEventAction<T> extends Action<StateMachineSendEventActionPayload> {
  type: StateMachineActionType.SendEvent;
  payload: StateMachineSendEventActionPayload;
}

export type StateMachineSendEventActionProcessor<T> = ActionProcessor<StateMachineSendEventAction<T>, T>;
export type StateMachineSendEventActionRequester<T> = ActionRequester<StateMachineSendEventAction<T>, T>;
