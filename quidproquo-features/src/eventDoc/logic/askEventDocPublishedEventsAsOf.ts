import { AskResponse } from 'quidproquo-core';
import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocGetById } from '../data/askEventDocGetById';
import { EventDocEvent } from '../models';
import { effectiveAsOf } from './selectors/effectiveAsOf';

/**
 * The events that make up the version published and effective at `clock` — the log truncated at
 * that version's head. Resolves the version from the persisted summary (`effectiveAsOf`, keyed on
 * `effectiveFrom`), then returns the events with index <= the version's `eventIndex` (the head
 * stamped at publish time). Returns null when the doc is missing/deleted or nothing is effective
 * yet. Assumes the store context is provided (wrap in `askEventDocProvideStore`). Fold the returned
 * events to get the published, as-of-`clock` state — the generic backbone of a "render published"
 * flow, mirroring `askEventDocGetPublishedAsOf` (which returns the version pointer, not its events).
 */
export function* askEventDocPublishedEventsAsOf(id: string, clock: QpqIsoDateTime): AskResponse<Nullable<EventDocEvent[]>> {
  const summary = yield* askEventDocGetById(id);
  if (!summary || summary.deletedAt) {
    return null;
  }

  const version = effectiveAsOf(summary, clock);
  if (!version) {
    return null;
  }

  const events = yield* askEventDocEventListAll(id);

  return events.filter((event) => event.payload.metadata.index <= version.eventIndex);
}
