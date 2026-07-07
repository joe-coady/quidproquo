import { EventDocEvent, EventDocSummary } from '../models';
import { eventDocSummaryReducer } from './eventDocSummaryReducer';

// Apply one event to the record: fold the reserved handlers, then stamp updatedAt/
// updatedBy from the event so content edits bump "last modified" too (the reducer
// no-ops domain events). Every event also advances the current (tail) version's
// `eventIndex` to its own log index — so a version's head always points at its last
// event (a published version lands on its PUBLISH event; the open draft tracks the log
// head). That head is the cutoff to fold/render the version: events with index <= it.
// Used incrementally by the backend append handler.
export const applyEventDocSummaryEvent = (model: EventDocSummary, event: EventDocEvent): EventDocSummary => {
  const [next] = eventDocSummaryReducer(model, event);
  const { index, createdAt, createdBy } = event.payload.metadata;
  const tail = next.versions.length - 1;

  return {
    ...next,
    updatedAt: createdAt,
    updatedBy: createdBy.userId,
    versions: next.versions.map((version, i) => (i === tail ? { ...version, eventIndex: index } : version)),
  };
};
