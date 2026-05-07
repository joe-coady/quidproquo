import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineGetActionRequester } from './StateMachineGetActionTypes';

export function* askStateMachineGet<T>(
  stateMachineName: string,
  id: string,
): StateMachineGetActionRequester<T> {
  return yield {
    type: StateMachineActionType.Get,
    payload: {
      stateMachineName,
      id,
    },
  };
}
