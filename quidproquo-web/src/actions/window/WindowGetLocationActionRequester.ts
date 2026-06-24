import { WindowActionType } from './WindowActionType';
import { WindowGetLocationActionRequester } from './WindowGetLocationActionRequesterTypes';

export function* askWindowGetLocation(): WindowGetLocationActionRequester {
  return yield { type: WindowActionType.GetLocation };
}
