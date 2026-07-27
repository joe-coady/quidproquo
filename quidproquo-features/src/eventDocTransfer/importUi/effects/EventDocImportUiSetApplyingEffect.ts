import { Effect } from 'quidproquo-core';

import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiSetApplyingPayload = {
  isApplying: boolean;
};

export type EventDocImportUiSetApplyingEffect = Effect<EventDocImportUiEffect.SetApplying, EventDocImportUiSetApplyingPayload>;
