import { Effect } from 'quidproquo-core';

import { EventDocSummary } from '../../../eventDoc/models';
import { EventDocExportUiEffect } from './EventDocExportUiEffect';

export type EventDocExportUiSetCandidatesPayload = {
  candidates: EventDocSummary[];
};

export type EventDocExportUiSetCandidatesEffect = Effect<EventDocExportUiEffect.SetCandidates, EventDocExportUiSetCandidatesPayload>;
