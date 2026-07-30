import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocListEffect } from '../effects/EventDocListEffect';
import type { EventDocListSetPageIndexEffect } from '../effects/EventDocListSetPageIndexEffect';

export function* askUIEventDocListSetPageIndex(pageIndex: number, cursor: Nullable<string>): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocListSetPageIndexEffect>(EventDocListEffect.SetPageIndex, { pageIndex, cursor });
}
