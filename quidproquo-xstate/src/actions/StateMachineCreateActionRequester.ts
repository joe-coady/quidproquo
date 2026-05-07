import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineCreateActionRequester } from './StateMachineCreateActionTypes';

export function* askStateMachineCreate<T>(
  stateMachineName: string,
  id: string,
  item: T,
): StateMachineCreateActionRequester<T> {
  return yield {
    type: StateMachineActionType.Create,
    payload: {
      stateMachineName,
      id,
      item,
    },
  };
}
