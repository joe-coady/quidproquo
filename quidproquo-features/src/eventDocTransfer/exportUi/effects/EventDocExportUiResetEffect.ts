import { Effect } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiResetPayload = Record<string, never>;

export type EventDocExportUiResetEffect = Effect<EventDocExportUiEffect.Reset, EventDocExportUiResetPayload>;
