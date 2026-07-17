import { Effect } from 'quidproquo-core';

import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetLoadingPayload = {
  isLoading: boolean;
};

export type EventDocListSetLoadingEffect = Effect<EventDocListEffect.SetLoading, EventDocListSetLoadingPayload>;
