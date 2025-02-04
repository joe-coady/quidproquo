import { SystemActionType, SystemBatchAction } from '../../actions';
import { Action } from '../../types';

export function isBatchAction(action: Action<any>): action is SystemBatchAction {
  return action.type === SystemActionType.Batch;
}
