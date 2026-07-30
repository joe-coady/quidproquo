import { Effect, Nullable } from 'quidproquo-core';

import { EventDocSummary } from '../../models';
import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListPageLoadedPayload = {
  items: EventDocSummary[];
  nextPageKey: Nullable<string>;
};

export type EventDocListPageLoadedEffect = Effect<EventDocListEffect.PageLoaded, EventDocListPageLoadedPayload>;
