import { Effect } from 'quidproquo-core';

import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetPagePayload = {
  page: number;
};

export type EventDocListSetPageEffect = Effect<EventDocListEffect.SetPage, EventDocListSetPagePayload>;
