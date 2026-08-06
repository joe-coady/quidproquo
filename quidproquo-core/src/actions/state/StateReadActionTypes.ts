import { Action } from '../../types/Action';
import { StateActionType } from './StateActionType';

// Payload
export type StateReadActionPayload = {
  path?: string;
};

export interface StateReadAction extends Action<StateReadActionPayload> {
  type: StateActionType.Read;
  payload: StateReadActionPayload;
}
