import { createLocalContextIdentifier } from 'quidproquo-core';

import { EventDocStore } from '../types/EventDocStore';

// Local context (never serialized across a service boundary) for the store
// binding. Empty default → askEventDocResolveStore throws if unprovided.
export const eventDocStoreContext = createLocalContextIdentifier<EventDocStore>('exengne-event-doc-store', {
  storeName: '',
  eventsStoreName: '',
  type: '',
  storageDriveName: '',
});
