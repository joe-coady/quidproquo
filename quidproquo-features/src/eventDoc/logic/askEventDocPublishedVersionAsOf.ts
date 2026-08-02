import { AskResponse } from 'quidproquo-core';
import { Nullable, QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocGetById } from '../data/askEventDocGetById';
import { EventDocVersionState } from '../models';
import { askEventDocDocumentStateAsOf } from './askEventDocDocumentStateAsOf';
import { effectiveAsOf } from './selectors/effectiveAsOf';

/**
 * The version published and effective at `clock`, together with the document state at
 * that version's head. Resolves the version from the persisted summary (`effectiveAsOf`,
 * keyed on `effectiveFrom`), then folds the state as of the version's `eventId` — the
 * head stamped at publish time — snapshot-seeded, so cost tracks the gap since the
 * nearest snapshot rather than the log. Returns null when the doc is missing/deleted,
 * nothing is effective yet, or the version's events are gone (a rewritten log). Assumes
 * the store context is provided (wrap in `askEventDocProvideStore`). The generic
 * backbone of a "render published" flow: use the state, and read `version.publishedAt`
 * to pin the doc's linked assets to the moment it was published.
 */
export function* askEventDocPublishedVersionAsOf(id: string, clock: QpqIsoDateTime): AskResponse<Nullable<EventDocVersionState>> {
  const summary = yield* askEventDocGetById(id);
  if (!summary || summary.deletedAt) {
    return null;
  }

  const version = effectiveAsOf(summary, clock);
  if (!version) {
    return null;
  }

  const stateAtVersion = yield* askEventDocDocumentStateAsOf(id, version.eventId);
  if (!stateAtVersion) {
    return null;
  }

  return { version, state: stateAtVersion.state };
}
