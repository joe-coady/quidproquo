import { AskResponse } from 'quidproquo-core';

import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocSummaryViewWrite } from '../data/askEventDocSummaryViewWrite';
import { foldEventDocSummary } from '../summary/foldEventDocSummary';

// Re-derive the queryable record from the WHOLE log — the projection's fallback path,
// O(log length). The stream projector's hot path derives the summary from the same
// incremental fold that writes snapshots (askEventDocProjectAtEvent), so this runs only
// where that fold can't be trusted or doesn't exist:
//
// - a collection with no registered functions object (nothing to fold views with),
// - a Remove stream record (a transfer rewrote the log out from under the snapshot
//   store, so a snapshot-seeded fold could resume from a snapshot of the OLD log),
// - a fold that declines or produces nothing (broken registration, emptied log).
//
// Re-deriving from the log is idempotent, which is what makes the stream's
// at-least-once delivery and its retries harmless.
export function* askEventDocSummaryRederive(modelId: string): AskResponse<void> {
  const events = yield* askEventDocEventListAll(modelId);
  const record = foldEventDocSummary(events);

  yield* askEventDocSummaryViewWrite(modelId, record);
}
