import { Effect, Nullable } from 'quidproquo-core';

import { EventDocBundleSource, EventDocTransferPlanRow } from '../../models';
import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiSetPlanPayload = {
  transferId: string;
  source: Nullable<EventDocBundleSource>;
  rows: EventDocTransferPlanRow[];
};

export type EventDocImportUiSetPlanEffect = Effect<EventDocImportUiEffect.SetPlan, EventDocImportUiSetPlanPayload>;
