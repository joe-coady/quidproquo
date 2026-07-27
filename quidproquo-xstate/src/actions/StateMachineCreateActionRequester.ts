import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineCreateActionRequester } from './StateMachineCreateActionTypes';

/** Creates a state machine entity from item, persisting it with the machine's initial snapshot, and returns the stored entity. */
export function* askStateMachineCreate<T>(stateMachineName: string, id: string, item: T): StateMachineCreateActionRequester<T> {
  return yield {
    type: StateMachineActionType.Create,
    payload: {
      stateMachineName,
      id,
      item,
    },
  };
}
