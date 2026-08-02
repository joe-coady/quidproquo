import { EventDocEvent } from './EventDocEvent';
import { EventDocSummary } from './EventDocSummary';

// Payload handed to a collection's `onAppend` inline function after ANY event (domain or
// lifecycle) has been durably appended. `state` is the FOLDED document as of that event
// (latest-shaped, snapshot-seeded — see askEventDocHookStates) and `previousState` the
// document as of the event before it, so a hook broadcasting the fresh fold or diffing a
// transition never re-reads or re-folds the log. `unknown` because hook inputs cross the
// inline-function boundary — the hook narrows to its collection's document type.
export type EventDocOnAppendInput = {
  docId: string;
  event: EventDocEvent;
  summary: EventDocSummary;
  state: unknown;
  previousState: unknown;
};
