import { EventDocEvent } from './EventDocEvent';
import { EventDocSummary } from './EventDocSummary';

// Payload handed to a collection's `onAppend` inline function after ANY event
// (domain or lifecycle) has been durably appended and the summary re-derived.
// The full log (including the new event) rides along so hooks that fold the
// document never have to re-read what the append just paged through.
export type EventDocOnAppendInput = {
  docId: string;
  event: EventDocEvent;
  summary: EventDocSummary;
  events: EventDocEvent[];
};
