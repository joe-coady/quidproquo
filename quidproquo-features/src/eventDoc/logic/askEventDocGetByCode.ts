import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

import { askEventDocList } from '../data/askEventDocList';
import { EventDocSummary } from '../models';

/**
 * The single non-deleted doc in the (provided) collection whose `code` matches — optionally scoped
 * to an owner (matched on `createdBy`). `code` is expected unique within that scope, so >1 match is
 * a data-integrity error (Conflict); 0 matches → null. Assumes the store context is provided (wrap
 * in `askEventDocProvideStore`). There is no GSI on `code` (and the dev KVS can't query one anyway),
 * so this lists the collection and filters in memory.
 */
export function* askEventDocGetByCode<T extends EventDocSummary = EventDocSummary>(code: string, ownerUserId?: string): AskResponse<Nullable<T>> {
  const summaries = yield* askEventDocList<T>();

  const matches = summaries.filter((summary) => summary.code === code && (ownerUserId === undefined || summary.createdBy === ownerUserId));

  if (matches.length === 0) {
    return null;
  }

  if (matches.length > 1) {
    return yield* askThrowError(ErrorTypeEnum.Conflict, `Multiple instances detected for code "${code}"`);
  }

  return matches[0];
}
