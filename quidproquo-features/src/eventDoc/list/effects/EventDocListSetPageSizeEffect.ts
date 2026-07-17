import { Effect } from 'quidproquo-core';

import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetPageSizePayload = {
  pageSize: number;
};

export type EventDocListSetPageSizeEffect = Effect<EventDocListEffect.SetPageSize, EventDocListSetPageSizePayload>;
