import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineGetStateActionRequester } from './StateMachineGetStateActionTypes';

/** Returns the current machine state of an entity: its state value and whether it has reached a final state. */
export function* askStateMachineGetState(stateMachineName: string, id: string): StateMachineGetStateActionRequester {
  return yield {
    type: StateMachineActionType.GetState,
    payload: {
      stateMachineName,
      id,
    },
  };
}
