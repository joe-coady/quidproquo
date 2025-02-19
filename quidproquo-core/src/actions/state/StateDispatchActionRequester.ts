import { StateActionType } from './StateActionType';
import { StateDispatchActionRequester } from './StateDispatchActionTypes';

export function* askStateDispatch<T>(action: T): StateDispatchActionRequester<T> {
  return yield { type: StateActionType.Dispatch, payload: { action } };
}
