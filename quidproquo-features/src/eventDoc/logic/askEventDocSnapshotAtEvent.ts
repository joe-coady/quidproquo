import { askInlineFunctionExecute, AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocSnapshotWrite } from '../data/askEventDocSnapshotWrite';
import { EventDocSnapshotFoldInput, EventDocSnapshotViews } from '../models';

/**
 * Fold a document as of ONE event and store the result: every view of the log prefix up
 * to (and including) that event, one snapshot row per view, all keyed at the event's id.
 *
 * The fold itself is the collection's registered snapshot-fold inline function — a
 * one-liner over the doc type's definition (`definition.foldSnapshotViews(events)`),
 * app-registered because the definition's reducers are app code this package cannot
 * import. What comes back is era-pinned per-view state (see foldEventDocLogAsWritten),
 * which this function stores verbatim.
 *
 * From-scratch on purpose: the whole prefix is read and folded every time. Seeding from
 * the previous snapshot instead is a read-cost optimisation that changes nothing about
 * what is stored, so it can arrive later without touching the stored shape.
 *
 * The prefix is read CONSISTENTLY: the caller is the event store's stream handler, so the
 * event being snapshotted was durably written moments ago, and an eventually-consistent
 * query can still miss it — which would store a snapshot at eventId that silently lacks
 * the event it claims to capture, permanently (nothing later rewrites an old eventId).
 */
export function* askEventDocSnapshotAtEvent(modelId: string, eventId: string, snapshotFold: string): AskResponse<void> {
  const events = yield* askEventDocEventListAll(modelId, { upToEventId: eventId, consistentRead: true });

  // An empty prefix folds to nothing worth storing — it can only mean the log's rows were
  // deleted out from under the stream (a transfer/cleanup), and a snapshot of an absent
  // document would just be a pristine seed masquerading as a fact.
  if (events.length === 0) {
    return;
  }

  const snapshotViews = yield* askInlineFunctionExecute<EventDocSnapshotViews, EventDocSnapshotFoldInput>(snapshotFold, {
    events,
    docId: modelId,
  });

  for (const [viewName, state] of Object.entries(snapshotViews)) {
    yield* askEventDocSnapshotWrite(modelId, viewName, eventId, state);
  }
}
