import GuidActionTypeEnum from './GuidActionTypeEnum';
import { Action } from '../../types/Action';

export interface GuidNewActionPayload {}

export interface GuidNewAction extends Action<GuidNewActionPayload> {
  type: GuidActionTypeEnum.New;
}
