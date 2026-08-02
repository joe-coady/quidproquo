import { AskResponse, createDynamicFunctionCaller, Nullable } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocSnapshotSeedLatest } from '../data/askEventDocSnapshotSeedLatest';
import { askEventDocSnapshotViewsWrite } from '../data/askEventDocSnapshotViewsWrite';
import { EventDocInvokableFunctions } from '../definition/types/EventDocInvokableFunctions';
import { EventDocSnapshotViews } from '../models';

/**
 * Fold a document as of ONE event and store the result: every view of the log up to (and
 * including) that event, one snapshot row per view, all keyed at the event's id.
 *
 * INCREMENTAL by default: the newest complete snapshot at or before the event seeds the
 * fold, and only the gap since it is read and folded — so the work per stream delivery
 * tracks the size of the burst, not the length of the log. The equivalence to a
 * from-scratch fold is owned by the fold layer (state-based acceptance + era-pinned
 * seeds, see foldSnapshotViews); this function only finds the seed and the gap. With no
 * usable seed — no snapshot yet, a pre-manifest snapshot, a partial set, or a fold that
 * declines the seed (a view added since it was written) — it falls back to folding the
 * whole prefix, whose write then restores a complete seed for next time.
 *
 * A seed AT the event itself means the snapshot is already fully written (the document
 * row is the set's last write), so a replayed delivery skips the work entirely.
 *
 * The fold itself is the `foldSnapshotViews` member of the collection's registered
 * dynamic-functions object (the doc type's definition), app-registered because the
 * definition's reducers are app code this package cannot import. What comes back is
 * era-pinned per-view state, stored verbatim.
 *
 * Event reads are CONSISTENT: the caller is the event store's stream handler, so the
 * event being snapshotted was durably written moments ago, and an eventually-consistent
 * query can still miss it — which would store a snapshot at eventId that silently lacks
 * the event it claims to capture, permanently (nothing later rewrites an old eventId).
 * The seed read stays eventually consistent — a stale seed only means folding a longer
 * gap for the same answer.
 */
export function* askEventDocSnapshotAtEvent(modelId: string, eventId: string, functionsName: string): AskResponse<void> {
  const functionsCaller = createDynamicFunctionCaller<EventDocInvokableFunctions>(functionsName);
  const seed = yield* askEventDocSnapshotSeedLatest(modelId, eventId);

  if (seed?.eventId === eventId) {
    return;
  }

  let snapshotViews: Nullable<EventDocSnapshotViews> = null;

  if (seed) {
    const gap = yield* askEventDocEventListAll(modelId, { afterEventId: seed.eventId, upToEventId: eventId, consistentRead: true });

    if (gap.length > 0) {
      snapshotViews = yield* functionsCaller.foldSnapshotViews(gap, seed.views);
    }
  }

  if (!snapshotViews) {
    const events = yield* askEventDocEventListAll(modelId, { upToEventId: eventId, consistentRead: true });

    // An empty prefix folds to nothing worth storing — it can only mean the log's rows
    // were deleted out from under the stream (a transfer/cleanup), and a snapshot of an
    // absent document would just be a pristine seed masquerading as a fact.
    if (events.length === 0) {
      return;
    }

    snapshotViews = yield* functionsCaller.foldSnapshotViews(events);

    // A fold given no seed has nothing to decline; null here is a broken registration,
    // and writing nothing beats writing a snapshot that claims the document is empty.
    if (!snapshotViews) {
      return;
    }
  }

  yield* askEventDocSnapshotViewsWrite(modelId, eventId, snapshotViews);
}
