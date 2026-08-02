import { getEventDocFunctionsIdentity } from '../../eventDoc/definition/getEventDocFunctionsIdentity';
import { EventDocFunctions } from '../../eventDoc/definition/types/EventDocFunctions';
import { EventDocTransferCollection } from '../models';

// What a service may list as a transferable collection:
// - its collection-list entry (anything carrying the registered `functions` object), so the
//   SAME array that drives the defineEventDoc calls passes straight through, no mapping;
// - the live functions object itself;
// - a bare registry entry, for a collection that needs the import hooks (onPublish/onAppend).
export type EventDocTransferCollectionSource = EventDocFunctions | { functions: EventDocFunctions } | EventDocTransferCollection;

// A collection-list entry carries its functions object under `functions`; the functions
// object itself is the thing with behaviour; a bare registry entry has neither.
const isEventDocFunctions = (source: EventDocTransferCollectionSource): source is EventDocFunctions =>
  typeof (source as EventDocFunctions).foldSnapshotViews === 'function';

export const toEventDocTransferCollection = (source: EventDocTransferCollectionSource): EventDocTransferCollection => {
  if ('functions' in source) {
    return getEventDocFunctionsIdentity(source.functions);
  }

  if (isEventDocFunctions(source)) {
    return getEventDocFunctionsIdentity(source);
  }

  return source;
};
