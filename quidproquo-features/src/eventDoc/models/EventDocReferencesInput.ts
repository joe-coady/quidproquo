import { EventDocEvent } from './EventDocEvent';

// Input to a collection's reference-collector inline function: the doc's COMPLETE event log plus its
// id. Mirrors EventDocRenderInput, with one difference worth knowing: the renderer is handed an
// already-resolved slice, whereas the collector gets everything and walks it itself, because a
// reference that existed only in an older version still has to be found (collectEventDocReferences).
export type EventDocReferencesInput = {
  events: EventDocEvent[];
  docId: string;
};
