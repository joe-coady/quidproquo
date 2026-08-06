import { createActionRequester } from 'quidproquo-core';

import { WindowActionType } from './WindowActionType';
import { WindowLocation } from './WindowGetLocationActionRequesterTypes';

/** Reads the current `window.location` as a plain serializable snapshot (never the live Location object). */
export const askWindowGetLocation = createActionRequester<WindowLocation>()({
  actionType: WindowActionType.GetLocation,
});
