import { StateActionType } from './StateActionType';
import { StateReadActionRequester } from './StateReadActionTypes';

export function* askStateRead<R>(path?: string): StateReadActionRequester<R> {
  return yield { type: StateActionType.Read, payload: { path } };
}
