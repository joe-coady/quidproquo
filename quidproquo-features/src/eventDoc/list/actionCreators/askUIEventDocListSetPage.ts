import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocListEffect } from '../effects/EventDocListEffect';
import type { EventDocListSetPageEffect } from '../effects/EventDocListSetPageEffect';

export function* askUIEventDocListSetPage(page: number): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocListSetPageEffect>(EventDocListEffect.SetPage, { page });
}
