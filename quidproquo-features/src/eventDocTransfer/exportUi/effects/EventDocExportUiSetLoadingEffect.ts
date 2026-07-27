import { Effect } from 'quidproquo-core';

import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetLoadingPayload = {
  isLoading: boolean;
};

export type EventDocExportUiSetLoadingEffect = Effect<EventDocExportUiEffect.SetLoading, EventDocExportUiSetLoadingPayload>;
