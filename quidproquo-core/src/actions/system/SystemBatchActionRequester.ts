import { SystemActionType } from './SystemActionType';
import { SystemBatchActionRequester } from './SystemBatchActionTypes';
import { Action } from '../../types/Action';

// TODO: Make typings better
export function* askBatch<TReturn extends Array<any>>(
  actions: Action<any>[],
): SystemBatchActionRequester<TReturn> {
  return yield { type: SystemActionType.Batch, payload: { actions } };
}
