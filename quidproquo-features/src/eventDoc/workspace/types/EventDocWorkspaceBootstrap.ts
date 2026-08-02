import { Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocSnapshotBase } from '../../models';

// A document slot's opening load: the newest server-side snapshot as the fold base plus
// every event after it. A null base means the server had no usable snapshot and `events`
// is the whole log from event zero — the workspace folds from the slot's initial state
// exactly as it did before snapshots existed.
export type EventDocWorkspaceBootstrap = {
  base: Nullable<EventDocSnapshotBase>;
  events: EventDocEvent[];
};
