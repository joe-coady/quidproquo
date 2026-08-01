import { EventDocEvent } from './EventDocEvent';

// Input to a collection's snapshot-fold inline function: the log PREFIX to fold (every
// event up to and including the one the snapshot is taken at) plus the doc's id for
// context. Mirrors EventDocRenderInput. The registered function is a one-liner over the
// doc type's definition — `definition.foldSnapshotViews(events)` — kept app-side because
// the definition (its reducers, its views) is app code the generic backend cannot import.
export type EventDocSnapshotFoldInput = {
  events: EventDocEvent[];
  docId: string;
};
