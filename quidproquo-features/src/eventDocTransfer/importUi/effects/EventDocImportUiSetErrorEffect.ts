import { Effect, Nullable } from 'quidproquo-core';

import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiSetErrorPayload = {
  error: Nullable<string>;
};

export type EventDocImportUiSetErrorEffect = Effect<EventDocImportUiEffect.SetError, EventDocImportUiSetErrorPayload>;
