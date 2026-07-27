import { Effect } from 'quidproquo-core';

import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiResetPayload = Record<string, never>;

export type EventDocImportUiResetEffect = Effect<EventDocImportUiEffect.Reset, EventDocImportUiResetPayload>;
