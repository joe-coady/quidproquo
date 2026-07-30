import { AskResponse, askStateDispatchEffect, Nullable } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EventDocListEffect } from '../effects/EventDocListEffect';
import type { EventDocListPageLoadedEffect } from '../effects/EventDocListPageLoadedEffect';

export function* askUIEventDocListPageLoaded(items: EventDocSummary[], nextPageKey: Nullable<string>): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocListPageLoadedEffect>(EventDocListEffect.PageLoaded, { items, nextPageKey });
}
