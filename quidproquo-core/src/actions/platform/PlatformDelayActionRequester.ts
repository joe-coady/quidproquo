import { PlatformActionType } from './PlatformActionType';
import { PlatformDelayActionRequester } from './PlatformDelayActionRequesterTypes';

export function* askDelay(timeMs: number): PlatformDelayActionRequester {
  yield { type: PlatformActionType.Delay, payload: { timeMs } };
}
