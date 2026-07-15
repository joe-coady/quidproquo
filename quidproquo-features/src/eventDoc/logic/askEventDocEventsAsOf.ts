import { AskResponse } from 'quidproquo-core';
import { QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { EventDocEvent } from '../models';

/**
 * The doc's event log as it stood at `clock` — every event stamped at or before that moment. Fold
 * these to get the state an editor would have shown then, drafts and all: this is "latest, as of
 * a time", NOT a published-version lookup, so the doc needs no published version to resolve.
 *
 * That distinction is the point. A `Latest` link is resolved against the moment its *referrer* was
 * published, so the referrer renders the linked doc exactly as its author saw it at publish time —
 * a layout or content item that was still an unpublished draft then is still what gets rendered.
 * Use `askEventDocPublishedVersionAsOf` when a doc's OWN published version is what's wanted.
 *
 * Assumes the store context is provided (wrap in `askEventDocProvideStore`).
 */
export function* askEventDocEventsAsOf(id: string, clock: QpqIsoDateTime): AskResponse<EventDocEvent[]> {
  const events = yield* askEventDocEventListAll(id);

  return events.filter((event) => event.payload.metadata.createdAt <= clock);
}
