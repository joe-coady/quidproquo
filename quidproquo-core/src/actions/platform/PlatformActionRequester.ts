import PlatformActionTypeEnum from './PlatformActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface PlatformDelayActionPayload extends ActionPayload {
  type: PlatformActionTypeEnum.Delay;
  payload: {
    timeMs: number;
  };
}

export function* askDelay(timeMs: number): Generator<PlatformDelayActionPayload, void, void> {
  yield { type: PlatformActionTypeEnum.Delay, payload: { timeMs } };
}
