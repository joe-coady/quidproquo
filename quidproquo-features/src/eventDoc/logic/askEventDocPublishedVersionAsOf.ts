import { AskResponse } from 'quidproquo-core';
import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocGetById } from '../data/askEventDocGetById';
import { EventDocVersionSlice } from '../models';
import { effectiveAsOf } from './selectors/effectiveAsOf';

/**
 * The version published and effective at `clock`, together with the events that compose it — the
 * log truncated at that version's head. Resolves the version from the persisted summary
 * (`effectiveAsOf`, keyed on `effectiveFrom`), then returns the events with index <= the version's
 * `eventIndex` (the head stamped at publish time). Returns null when the doc is missing/deleted or
 * nothing is effective yet. Assumes the store context is provided (wrap in
 * `askEventDocProvideStore`). The generic backbone of a "render published" flow: fold the events for
 * the published state, and read `version.publishedAt` to pin the doc's linked assets to the moment
 * it was published. Use `askEventDocPublishedEventsAsOf` when only the events are needed.
 */
export function* askEventDocPublishedVersionAsOf(id: string, clock: QpqIsoDateTime): AskResponse<Nullable<EventDocVersionSlice>> {
  const summary = yield* askEventDocGetById(id);
  if (!summary || summary.deletedAt) {
    return null;
  }

  const version = effectiveAsOf(summary, clock);
  if (!version) {
    return null;
  }

  const events = yield* askEventDocEventListAll(id);

  return {
    version,
    events: events.filter((event) => event.payload.metadata.index <= version.eventIndex),
  };
}
