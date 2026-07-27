import { Effect } from 'quidproquo-core';

import { EventDocTransferPlanRow } from '../../models';
import { EventDocImportUiEffect } from './EventDocImportUiEffect';

export type EventDocImportUiSetResultPayload = {
  rows: EventDocTransferPlanRow[];
};

export type EventDocImportUiSetResultEffect = Effect<EventDocImportUiEffect.SetResult, EventDocImportUiSetResultPayload>;
