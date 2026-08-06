import { Action } from 'quidproquo-core';

import { StateMachineActionType } from './StateMachineActionType';

export type StateMachineCreateActionPayload<T> = {
  stateMachineName: string;
  id: string;
  item: T;
};

export interface StateMachineCreateAction<T> extends Action<StateMachineCreateActionPayload<T>> {
  type: StateMachineActionType.Create;
  payload: StateMachineCreateActionPayload<T>;
}
