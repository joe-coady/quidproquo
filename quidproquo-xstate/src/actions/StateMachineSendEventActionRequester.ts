import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineEvent, StateMachineSendEventActionRequester } from './StateMachineSendEventActionTypes';

export function* askStateMachineSendEvent<T>(
  stateMachineName: string,
  id: string,
  event: StateMachineEvent,
): StateMachineSendEventActionRequester<T> {
  return yield {
    type: StateMachineActionType.SendEvent,
    payload: {
      stateMachineName,
      id,
      event,
    },
  };
}
