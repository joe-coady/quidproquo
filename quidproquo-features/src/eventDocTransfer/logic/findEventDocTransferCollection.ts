import { Nullable } from 'quidproquo-core';

import { EventDocDocRef, EventDocTransferCollection, EventDocTransferRegistry } from '../models';

/**
 * The registered collection a doc reference addresses, or null when nothing matches. Null is a
 * hard stop for the caller, not something to skip past: it means either a reference into another
 * service (the transfer runs where the stores are, so it cannot read a sibling service's) or a
 * collection the service forgot to register. Both are misconfigurations worth failing loudly on
 * rather than silently exporting an incomplete manifest.
 */
export const findEventDocTransferCollection = (registry: EventDocTransferRegistry, ref: EventDocDocRef): Nullable<EventDocTransferCollection> => {
  if (ref.service !== registry.service) {
    return null;
  }

  return registry.collections.find((collection) => collection.type === ref.type) ?? null;
};
