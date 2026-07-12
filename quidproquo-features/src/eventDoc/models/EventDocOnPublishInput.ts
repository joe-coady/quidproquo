import { EventDocEvent } from './EventDocEvent';
import { EventDocSummary } from './EventDocSummary';

// Payload handed to a collection's `onPublish` inline function after a Publish
// event has been durably appended and the summary re-derived.
export type EventDocOnPublishInput = {
  docId: string;
  event: EventDocEvent;
  summary: EventDocSummary;
};
