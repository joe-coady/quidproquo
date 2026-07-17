import { Effect, Nullable } from 'quidproquo-core';

import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetErrorPayload = {
  error: Nullable<string>;
};

export type EventDocListSetErrorEffect = Effect<EventDocListEffect.SetError, EventDocListSetErrorPayload>;
