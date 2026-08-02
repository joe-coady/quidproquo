import { EventDocEvent } from '../../models';

// The history panel's on-demand read: saved events NEWEST-FIRST, loaded a page at a
// time walking backwards in time. `events` accumulates as older pages load;
// `nextPageKey` is the store cursor for the next OLDER page (absent = the log's
// beginning has been reached). Display-only — nothing folds from this.
export type EventDocWorkspaceHistoryPage = {
  events: EventDocEvent[];
  nextPageKey?: string;
};
