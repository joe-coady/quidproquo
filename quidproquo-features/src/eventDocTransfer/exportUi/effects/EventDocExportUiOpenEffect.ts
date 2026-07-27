import { Effect } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

// No payload: the dialog opens with nothing picked and loads its own candidates.
export type EventDocExportUiOpenPayload = Record<string, never>;

export type EventDocExportUiOpenEffect = Effect<EventDocExportUiEffect.Open, EventDocExportUiOpenPayload>;
