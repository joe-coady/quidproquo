import { askConfigGetGlobal, AskResponse } from 'quidproquo-core';

import { EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL, EVENT_DOC_TRANSFER_SERVICE_GLOBAL } from '../constants';
import { EventDocTransferCollection, EventDocTransferRegistry } from '../models';

// An empty hook name means "not configured" (that is what the definer emits), and the store builder
// wants undefined rather than '' so the store reads the same as one built by defineEventDocRoutes.
const toCollection = (collection: EventDocTransferCollection): EventDocTransferCollection => ({
  storeName: collection.storeName,
  type: collection.type,
  onPublish: collection.onPublish || undefined,
  onAppend: collection.onAppend || undefined,
});

// Bridge the transfer routes' globals into the registry the stories take explicitly.
export function* askEventDocTransferReadRegistry(): AskResponse<EventDocTransferRegistry> {
  const service = yield* askConfigGetGlobal<string>(EVENT_DOC_TRANSFER_SERVICE_GLOBAL);
  const collections = yield* askConfigGetGlobal<EventDocTransferCollection[]>(EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL);

  return { service, collections: collections.map(toCollection) };
}
