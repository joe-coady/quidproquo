import { buildEffectReducer, QpqReducer } from 'quidproquo-core';

import { ReservedEventDocEffects } from '../fold/ReservedEventDocEffects';
import {
  EventDocEffect,
  EventDocEvent,
  EventDocSummary,
} from '../models';
import { createSummaryDraft } from './stateUpdaters/createSummaryDraft';
import { initSummary } from './stateUpdaters/initSummary';
import { publishSummary } from './stateUpdaters/publishSummary';
import { setSummaryCode } from './stateUpdaters/setSummaryCode';
import { setSummaryName } from './stateUpdaters/setSummaryName';

// Folds the reserved identity/lifecycle events into the queryable record. Domain
// (content) events bubble `[model, false]` — the record ignores them (the applier still
// bumps updatedAt). Cast to accept any EventDocEvent: buildEffectReducer skips
// unknown types, so it genuinely handles the whole log.
export const eventDocSummaryReducer = buildEffectReducer<
  EventDocSummary,
  ReservedEventDocEffects
>({
  [EventDocEffect.InitState]: initSummary,
  [EventDocEffect.SetCode]: setSummaryCode,
  [EventDocEffect.SetName]: setSummaryName,
  [EventDocEffect.CreateDraft]: createSummaryDraft,
  [EventDocEffect.Publish]: publishSummary,
}) as QpqReducer<EventDocSummary, EventDocEvent>;
