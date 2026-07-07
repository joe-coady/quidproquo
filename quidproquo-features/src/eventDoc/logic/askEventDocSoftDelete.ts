import { askDateNow, AskResponse } from 'quidproquo-core';

import { askValidateModelOrThrowError } from '../../validation/askValidateModelOrThrowError';
import { askEventDocUpsert } from '../data/askEventDocUpsert';
import { EventDocSummary, eventDocSummarySchema } from '../models';
import { askEventDocGetByIdOrThrow } from './askEventDocGetByIdOrThrow';

/**
 * Soft-delete via `deletedAt` — versions and blob claims stay intact;
 * `askEventDocList` hides it by default.
 */
export function* askEventDocSoftDelete(id: string, updatedBy: string): AskResponse<EventDocSummary> {
  const model = yield* askEventDocGetByIdOrThrow(id);
  const now = yield* askDateNow();

  const updated: EventDocSummary = {
    ...model,
    deletedAt: now,
    updatedAt: now,
    updatedBy,
  };

  yield* askValidateModelOrThrowError(updated, eventDocSummarySchema);
  yield* askEventDocUpsert(updated);

  return updated;
}
