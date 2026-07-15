import { EventDocEvent } from './EventDocEvent';
import { EventDocVersion } from './EventDocVersion';

// A resolved version paired with the events that compose it — the log truncated at the version's
// head. Returned by the as-of resolvers so a caller can both fold the state AND read the version's
// own stamps: a "render published" flow pins its linked docs to `version.publishedAt`, so the
// events alone aren't enough.
export type EventDocVersionSlice = {
  version: EventDocVersion;
  events: EventDocEvent[];
};
