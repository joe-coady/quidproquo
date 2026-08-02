import { AskResponse } from 'quidproquo-core';

import { askEventDocEventLast } from '../data/askEventDocEventLast';
import { askEventDocEventList } from '../data/askEventDocEventList';
import { askEventDocSnapshotBaseLatest } from '../data/askEventDocSnapshotBaseLatest';
import { EventDocEventBootstrapPage } from '../models';

export type EventDocEventBootstrapPageOptions = {
  limit?: number;
  nextPageKey?: string;
};

/**
 * The reader's bootstrap read: the newest usable fold base plus the first page of events
 * after it, in one shape. No usable base (never snapshotted, unresolvable blob, empty
 * log) degrades in-band to `base: null` with the page starting at the log's beginning —
 * the caller folds from scratch exactly as it would have before snapshots existed.
 *
 * The base lookup is clamped to the log's current head so a snapshot that outlived its
 * events (see askEventDocSnapshotBaseLatest) is never served with an empty tail. The head
 * is read first and eventually-consistently: a stale head only surfaces an older base,
 * and the tail read that follows still returns everything after it.
 */
export function* askEventDocEventBootstrapPage(
  modelId: string,
  options?: EventDocEventBootstrapPageOptions,
): AskResponse<EventDocEventBootstrapPage> {
  const head = yield* askEventDocEventLast(modelId);

  if (!head) {
    return { base: null, items: [] };
  }

  const base = yield* askEventDocSnapshotBaseLatest(modelId, head.payload.metadata.eventId);

  const page = yield* askEventDocEventList(modelId, {
    limit: options?.limit,
    nextPageKey: options?.nextPageKey,
    afterEventId: base?.eventId,
  });

  return { ...page, base };
}
