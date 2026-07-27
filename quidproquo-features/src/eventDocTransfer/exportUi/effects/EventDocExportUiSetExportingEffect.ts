import { Effect } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetExportingPayload = {
  isExporting: boolean;
};

export type EventDocExportUiSetExportingEffect = Effect<EventDocExportUiEffect.SetExporting, EventDocExportUiSetExportingPayload>;
