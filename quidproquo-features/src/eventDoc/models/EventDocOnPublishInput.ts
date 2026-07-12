import { EventDocEvent } from './EventDocEvent';
import { EventDocSummary } from './EventDocSummary';

// Payload handed to a collection's `onPublish` inline function after a Publish
// event has been durably appended and the summary re-derived. The full log
// (including the publish event) rides along so hooks that fold the document
// never have to re-read what the append just paged through.
export type EventDocOnPublishInput = {
  docId: string;
  event: EventDocEvent;
  summary: EventDocSummary;
  events: EventDocEvent[];
};
