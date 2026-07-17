import { Effect } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListAddItemPayload = {
  item: EventDocSummary;
};

export type EventDocListAddItemEffect = Effect<EventDocListEffect.AddItem, EventDocListAddItemPayload>;
