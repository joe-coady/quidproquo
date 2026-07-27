import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineEvent, StateMachineSendEventActionRequester } from './StateMachineSendEventActionTypes';

/**
 * Sends an event to a state machine instance, persisting the transition and
 * running any configured guard and action stories. Errors with BadRequest when
 * the event is not valid for the current state.
 */
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
