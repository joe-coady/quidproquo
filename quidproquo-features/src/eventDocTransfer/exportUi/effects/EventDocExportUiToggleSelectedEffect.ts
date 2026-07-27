import { Effect } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiToggleSelectedPayload = {
  id: string;
};

export type EventDocExportUiToggleSelectedEffect = Effect<EventDocExportUiEffect.ToggleSelected, EventDocExportUiToggleSelectedPayload>;
