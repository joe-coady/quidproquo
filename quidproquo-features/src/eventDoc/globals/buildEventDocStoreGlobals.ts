import {
  EVENT_DOC_EVENT_VALIDATOR_GLOBAL,
  EVENT_DOC_EVENTS_STORE_NAME_GLOBAL,
  EVENT_DOC_ON_APPEND_GLOBAL,
  EVENT_DOC_ON_PUBLISH_GLOBAL,
  EVENT_DOC_RENDERER_GLOBAL,
  EVENT_DOC_SCOPE_RESOLVER_GLOBAL,
  EVENT_DOC_STORAGE_DRIVE_GLOBAL,
  EVENT_DOC_STORE_NAME_GLOBAL,
  EVENT_DOC_TYPE_GLOBAL,
} from '../constants/eventDocGlobalNames';
import { EventDocStore } from '../types/EventDocStore';

// THE single source for the per-route globals askEventDocProvideStoreFromGlobals
// reads back. Every definer that mounts eventDoc-context routes (defineEventDocRoutes,
// defineTenantRoutes, defineEventDocAi) MUST spread this - a hand-copied map
// silently misses new store fields and the bridge then throws "Global config X
// not found" at request time. Optional fields are always set (empty when
// unconfigured) so the bridge can read unconditionally.
export const buildEventDocStoreGlobals = (store: EventDocStore): Record<string, unknown> => ({
  [EVENT_DOC_STORE_NAME_GLOBAL]: store.storeName,
  [EVENT_DOC_EVENTS_STORE_NAME_GLOBAL]: store.eventsStoreName,
  [EVENT_DOC_TYPE_GLOBAL]: store.type,
  [EVENT_DOC_STORAGE_DRIVE_GLOBAL]: store.storageDriveName,
  [EVENT_DOC_EVENT_VALIDATOR_GLOBAL]: store.eventValidator ?? '',
  [EVENT_DOC_RENDERER_GLOBAL]: store.eventRenderer ?? '',
  [EVENT_DOC_ON_PUBLISH_GLOBAL]: store.onPublish ?? '',
  [EVENT_DOC_ON_APPEND_GLOBAL]: store.onAppend ?? '',
  [EVENT_DOC_SCOPE_RESOLVER_GLOBAL]: store.scopeResolver ?? '',
});
