import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineGetActionRequester } from './StateMachineGetActionTypes';

/** Returns the stored entity for a state machine instance, including its persisted machine state. */
export function* askStateMachineGet<T>(stateMachineName: string, id: string): StateMachineGetActionRequester<T> {
  return yield {
    type: StateMachineActionType.Get,
    payload: {
      stateMachineName,
      id,
    },
  };
}
