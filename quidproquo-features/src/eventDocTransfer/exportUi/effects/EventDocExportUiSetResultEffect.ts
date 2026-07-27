import { Effect } from 'quidproquo-core';

import { EventDocTransferExportResult } from '../../models';
import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetResultPayload = {
  result: EventDocTransferExportResult;
};

export type EventDocExportUiSetResultEffect = Effect<EventDocExportUiEffect.SetResult, EventDocExportUiSetResultPayload>;
