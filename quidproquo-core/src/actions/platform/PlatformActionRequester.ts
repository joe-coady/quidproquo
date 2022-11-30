import PlatformActionTypeEnum from './PlatformActionTypeEnum';
import { PlatformDelayAction } from './PlatformActionRequesterTypes';

export function* askDelay(timeMs: number): Generator<PlatformDelayAction, void, void> {
  yield { type: PlatformActionTypeEnum.Delay, payload: { timeMs } };
}
