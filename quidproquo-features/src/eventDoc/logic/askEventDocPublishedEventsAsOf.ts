import { AskResponse } from 'quidproquo-core';
import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { EventDocEvent } from '../models';
import { askEventDocPublishedVersionAsOf } from './askEventDocPublishedVersionAsOf';

/**
 * The events that make up the version published and effective at `clock` — the log truncated at
 * that version's head. Returns null when the doc is missing/deleted or nothing is effective yet.
 * Assumes the store context is provided (wrap in `askEventDocProvideStore`). Fold the returned
 * events to get the published, as-of-`clock` state. The events-only view of
 * `askEventDocPublishedVersionAsOf` — reach for that one when the resolved version's own stamps
 * matter too (e.g. pinning a doc's linked assets to its `publishedAt`).
 */
export function* askEventDocPublishedEventsAsOf(id: string, clock: QpqIsoDateTime): AskResponse<Nullable<EventDocEvent[]>> {
  const slice = yield* askEventDocPublishedVersionAsOf(id, clock);

  return slice?.events ?? null;
}
