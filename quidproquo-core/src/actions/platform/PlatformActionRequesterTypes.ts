import PlatformActionTypeEnum from './PlatformActionTypeEnum';
import { Action } from '../../types/Action';

export interface PlatformDelayActionPayload {
  timeMs: number;
}

export interface PlatformDelayAction extends Action<PlatformDelayActionPayload> {
  type: PlatformActionTypeEnum.Delay;
}
