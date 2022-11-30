import GuidActionTypeEnum from './GuidActionTypeEnum';
import { Action } from '../../types/Action';

export interface GuidNewActionPayload {}

export interface GuidNewAction extends Action {
  type: GuidActionTypeEnum.New;
  payload?: GuidNewActionPayload;
}
