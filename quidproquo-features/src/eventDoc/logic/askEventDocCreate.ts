import { askNewGuid, AskResponse } from 'quidproquo-core';

import { askValidateModelOrThrowError } from '../../validation/askValidateModelOrThrowError';
import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocUpsert } from '../data/askEventDocUpsert';
import { EventDocEventActor, EventDocSummary, eventDocSummaryViewSchema } from '../models';
import { applyEventDocSummaryEvent, createEventDocSummarySeed } from '../summary';
import { askEventDocSeedInitState } from './askEventDocSeedInitState';

/**
 * Create a model: seed the INIT_STATE event that opens its log, then derive the record
 * (the queryable view) from it via the record reducer — the same path every later
 * append uses, so create and append can't drift.
 */
export function* askEventDocCreate(name: string, code: string, actor: EventDocEventActor): AskResponse<EventDocSummary> {
  const { type } = yield* askEventDocResolveStore();
  const id = yield* askNewGuid();

  const initEvent = yield* askEventDocSeedInitState(id, code, name, actor);

  const model = applyEventDocSummaryEvent(createEventDocSummarySeed(), initEvent);

  yield* askValidateModelOrThrowError(model, eventDocSummaryViewSchema);
  yield* askEventDocUpsert(model);

  // Callers get the stored shape back; `type` is the store's, and the store is what just
  // wrote it.
  return { ...model, type };
}
