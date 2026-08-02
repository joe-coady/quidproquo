import { EventDocEvent } from './EventDocEvent';
import { EventDocSnapshotViews } from './EventDocSnapshotViews';

// Input to a collection's snapshot-fold inline function, plus the doc's id for context.
// Mirrors EventDocRenderInput. The registered function is a one-liner over the doc type's
// definition — `definition.foldSnapshotViews(events, seedViews)` — kept app-side because
// the definition (its reducers, its views) is app code the generic backend cannot import.
//
// Without `seedViews`, `events` is the whole log PREFIX (every event up to and including
// the one the snapshot is taken at) and the fold runs from scratch. With `seedViews` — a
// previous snapshot's per-view states — `events` is only the GAP since that snapshot, and
// the fold resumes from the seed; this is what keeps snapshotting constant-time as a log
// grows. A fold handed a seed it cannot use (a view it now has that the seed lacks)
// returns null, and the caller retries from scratch.
export type EventDocSnapshotFoldInput = {
  events: EventDocEvent[];
  docId: string;
  seedViews?: EventDocSnapshotViews;
};
