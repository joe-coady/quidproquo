import { EventDocTransferCollection } from './EventDocTransferCollection';

// Everything the transfer stories need to know about the service they run in: which service
// name EventDocLinks use to address it, and the collections it owns. Read once per request from
// the route globals (askEventDocTransferReadRegistry) and threaded explicitly, so no story has
// to reach for ambient config.
export type EventDocTransferRegistry = {
  service: string;
  collections: EventDocTransferCollection[];
};
