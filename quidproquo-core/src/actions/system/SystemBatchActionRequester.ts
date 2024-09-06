import { SystemActionType } from './SystemActionType';
import { SystemBatchActionRequester } from './SystemBatchActionTypes';
import { Action } from '../../types/Action';

// TODO: Make typings better
export function* askBatch<TReturn extends Array<any> = any[]>(actions: Action<any>[]): SystemBatchActionRequester<TReturn> {
  // If we only have one action, just execute it directly
  // No need to batch it
  if (actions.length === 1) {
    return [yield actions[0]] as TReturn;
  }

  // Otherwise, batch the actions
  return yield { type: SystemActionType.Batch, payload: { actions } };
}
