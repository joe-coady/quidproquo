import { AskResponse } from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

import { askEventDocGetByCode } from './askEventDocGetByCode';

/**
 * The id of the doc whose `code` matches (optionally owner-scoped), or null. Thin convenience over
 * `askEventDocGetByCode` for callers that only need the id and no per-record policy. Assumes the
 * store context is provided.
 */
export function* askEventDocGetIdByCode(code: string, ownerUserId?: string): AskResponse<Nullable<string>> {
  const summary = yield* askEventDocGetByCode(code, ownerUserId);

  return summary?.id ?? null;
}
