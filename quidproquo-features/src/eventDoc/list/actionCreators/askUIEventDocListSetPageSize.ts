import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocListEffect } from '../effects/EventDocListEffect';
import type { EventDocListSetPageSizeEffect } from '../effects/EventDocListSetPageSizeEffect';

export function* askUIEventDocListSetPageSize(pageSize: number): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocListSetPageSizeEffect>(EventDocListEffect.SetPageSize, { pageSize });
}
