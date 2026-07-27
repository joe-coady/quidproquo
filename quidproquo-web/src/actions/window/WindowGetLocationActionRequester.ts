import { WindowActionType } from './WindowActionType';
import { WindowGetLocationActionRequester } from './WindowGetLocationActionRequesterTypes';

/** Reads the current `window.location` as a plain serializable snapshot (never the live Location object). */
export function* askWindowGetLocation(): WindowGetLocationActionRequester {
  return yield { type: WindowActionType.GetLocation };
}
