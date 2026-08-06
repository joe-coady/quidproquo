import { StateMachineActionType } from './StateMachineActionType';

export type StateMachineGetStateActionPayload = {
  stateMachineName: string;
  id: string;
};

/** The current machine state: the state value (objects serialised to JSON) and whether a final state was reached. */
export type StateMachineStateInfo = {
  value: string;
  done: boolean;
};
