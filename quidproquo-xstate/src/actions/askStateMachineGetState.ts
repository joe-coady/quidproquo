import { createActionRequester } from 'quidproquo-core';
import { StateMachineActionType } from './StateMachineActionType';
import { StateMachineStateInfo } from './StateMachineGetStateActionTypes';

export const askStateMachineGetState = createActionRequester<StateMachineStateInfo>()({
  actionType: StateMachineActionType.GetState,
  getPayload: (stateMachineName: string, id: string) => ({ stateMachineName, id }),
});
