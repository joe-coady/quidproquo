import { Effect } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetItemsPayload = {
  items: EventDocSummary[];
};

export type EventDocListSetItemsEffect = Effect<EventDocListEffect.SetItems, EventDocListSetItemsPayload>;
