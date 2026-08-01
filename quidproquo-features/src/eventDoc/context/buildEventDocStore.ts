import { eventDocEventsStoreName } from '../constants/eventDocEventsStoreName';
import { eventDocSnapshotsStoreName } from '../constants/eventDocSnapshotsStoreName';
import { eventDocStorageDriveName } from '../constants/eventDocStorageDriveName';
import { EventDocStore } from '../types/EventDocStore';

// One EventDoc collection's identity, minus the derivable bits. Pass it to
// `askEventDocProvideStore` (custom routes) — the events-table + blob-drive names are
// derived from `storeName`.
export type EventDocStoreOptions = {
  storeName: string;
  type: string;
  eventValidator?: string;
  eventRenderer?: string;
  onPublish?: string;
  onAppend?: string;
  scopeResolver?: string;
  referenceResolver?: string;
};

// Assemble an EventDocStore from a collection's storeName + type. The single source for the
// events-table / blob-drive naming convention — used by both the per-route globals
// (`defineEventDocRoutes`) and hand-written routes (`askEventDocProvideStore`), so a custom
// route and a built-in route describe the exact same store.
export const buildEventDocStore = ({
  storeName,
  type,
  eventValidator,
  eventRenderer,
  onPublish,
  onAppend,
  scopeResolver,
  referenceResolver,
}: EventDocStoreOptions): EventDocStore => ({
  storeName,
  eventsStoreName: eventDocEventsStoreName(storeName),
  snapshotsStoreName: eventDocSnapshotsStoreName(storeName),
  type,
  storageDriveName: eventDocStorageDriveName(storeName),
  eventValidator,
  eventRenderer,
  onPublish,
  onAppend,
  scopeResolver,
  referenceResolver,
});
