import { Effect, Nullable } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetErrorPayload = {
  error: Nullable<string>;
};

export type EventDocExportUiSetErrorEffect = Effect<EventDocExportUiEffect.SetError, EventDocExportUiSetErrorPayload>;
