import { StateMachineActionType } from './StateMachineActionType';

export type StateMachineGetActionPayload = {
  stateMachineName: string;
  id: string;
};

// T is the caller's entity shape; it only affects the processor/requester
// return type, but stays on the action so all four generics line up.
