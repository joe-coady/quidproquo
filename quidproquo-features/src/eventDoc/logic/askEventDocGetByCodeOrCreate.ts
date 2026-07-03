import { AskResponse } from 'quidproquo-core';

import { EventDocEventActor, EventDocSummary } from '../models';
import { askEventDocCreate } from './askEventDocCreate';
import { askEventDocGetByCode } from './askEventDocGetByCode';

/**
 * The doc with `code` (optionally owner-scoped), creating it on first use. Finds via
 * `askEventDocGetByCode` (so >1 existing match is a Conflict); on a miss, creates it with
 * `name`/`code`/`actor`. Assumes the store context is provided. NOT concurrency-safe — two
 * simultaneous misses both create; serialise (e.g. queue concurrency 1) or add a conditional create
 * if callers can race.
 */
export function* askEventDocGetByCodeOrCreate(
  code: string,
  name: string,
  actor: EventDocEventActor,
  ownerUserId?: string
): AskResponse<EventDocSummary> {
  const existing = yield* askEventDocGetByCode(code, ownerUserId);
  if (existing) {
    return existing;
  }

  return yield* askEventDocCreate(name, code, actor);
}
