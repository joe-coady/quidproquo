import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineGetStateActionRequester } from './StateMachineGetStateActionTypes';

export function* askStateMachineGetState(
  stateMachineName: string,
  id: string,
): StateMachineGetStateActionRequester {
  return yield {
    type: StateMachineActionType.GetState,
    payload: {
      stateMachineName,
      id,
    },
  };
}
