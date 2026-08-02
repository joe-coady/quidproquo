import { EventDocEvent } from './EventDocEvent';
import { EventDocSummary } from './EventDocSummary';

// Payload handed to a collection's `onPublish` inline function after a Publish event has
// been durably appended. `state` is the FOLDED document as of the publish event (latest-
// shaped, snapshot-seeded — see askEventDocHookStates) and `previousState` the document
// as of the event before it, so a hook materialising a read model or diffing a
// transition never re-reads or re-folds the log. `unknown` because hook inputs cross the
// inline-function boundary — the hook narrows to its collection's document type.
export type EventDocOnPublishInput = {
  docId: string;
  event: EventDocEvent;
  summary: EventDocSummary;
  state: unknown;
  previousState: unknown;
};
