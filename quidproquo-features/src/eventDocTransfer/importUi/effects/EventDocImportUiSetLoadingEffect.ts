import { Effect } from 'quidproquo-core';

import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiSetLoadingPayload = {
  isLoading: boolean;
};

export type EventDocImportUiSetLoadingEffect = Effect<EventDocImportUiEffect.SetLoading, EventDocImportUiSetLoadingPayload>;
