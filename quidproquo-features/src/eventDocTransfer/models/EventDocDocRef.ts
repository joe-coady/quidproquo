// A doc addressed the way an EventDocLink addresses one, minus the resolution mode: the
// coordinates the transfer feature routes on. `service` matches EventDocLink.eventDocService
// and `type` the collection's `type` (its store partition key).
export type EventDocDocRef = {
  service: string;
  type: string;
  id: string;
};
