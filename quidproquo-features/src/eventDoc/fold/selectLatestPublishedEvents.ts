import { EventDocEffect, EventDocEvent } from '../models';

// The slice of an event-doc log that belongs to the latest PUBLISHED version: every event
// up to and including the most recent PUBLISH (events after it are the next, unpublished
// draft). Returns [] when the doc has never been published, so callers can treat an
// unpublished doc as having no effective state. Pure — pair with `foldEventDocLog` to get
// the published state (drafts then never take effect until published).
export const selectLatestPublishedEvents = (events: EventDocEvent[]): EventDocEvent[] => {
  const lastPublishIndex = events.map((event) => event.type).lastIndexOf(EventDocEffect.Publish);

  return lastPublishIndex === -1 ? [] : events.slice(0, lastPublishIndex + 1);
};
