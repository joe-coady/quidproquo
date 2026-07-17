import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EventDocListEffect } from '../effects/EventDocListEffect';
import type { EventDocListSetItemsEffect } from '../effects/EventDocListSetItemsEffect';

export function* askUIEventDocListSetItems(items: EventDocSummary[]): AskResponse<void> {
  yield* askStateDispatchEffect<EventDocListSetItemsEffect>(EventDocListEffect.SetItems, { items });
}
