import { QpqIsoDateTime } from 'quidproquo-core';

import type { EventDocStatus } from './EventDocStatus';

// Base shape every folded document state intersects (the client folds the log; the
// backend never reduces). schemaVersion is the event-set/migration version (which
// reducer applies) — NOT documentVersion, the publish counter (1,2,3…) folded from the
// lifecycle events. id/code/name come from INIT (code/name editable via SET_CODE/
// SET_NAME); createdAt is INIT's time, updatedAt the latest event's time.
export type EventDocDocument = {
  schemaVersion: number;
  id: string;
  code: string;
  name: string;
  documentVersion: number;
  status: EventDocStatus;
  createdAt: QpqIsoDateTime;
  updatedAt: QpqIsoDateTime;

  // Soft delete, folded from DELETE / RESTORE. Absent means live.
  deletedAt?: QpqIsoDateTime;
  deletedBy?: string;

  // The clientMessageIds of the most recently ACCEPTED events (rolling window, newest
  // last), stamped by foldEventDocLogStep outside any reducer — like updatedAt. This is
  // the retry-dedup memory: it lives ON the state, rather than in fold-loop bookkeeping,
  // so that any fold resuming from a stored state (a snapshot, the workspace's
  // accumulator) reaches the same accept/reject verdicts as a fold from scratch.
  recentClientMessageIds?: string[];
};
