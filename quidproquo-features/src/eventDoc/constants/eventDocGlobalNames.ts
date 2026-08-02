export const EVENT_DOC_STORE_NAME_GLOBAL = 'eventDocStoreName';

// Map of doc TYPE -> registered dynamic-functions name (see defineDynamicFunctions) whose
// foldSnapshotViews the stream projector invokes, passed to the event store's stream
// runtime. Keyed by type because the stream serves the whole store and one store can host
// several collections; a type with no entry simply is not snapshotted.
export const EVENT_DOC_SNAPSHOT_FUNCTIONS_GLOBAL = 'eventDocSnapshotFunctions';
export const EVENT_DOC_EVENTS_STORE_NAME_GLOBAL = 'eventDocEventsStoreName';
export const EVENT_DOC_TYPE_GLOBAL = 'eventDocType';

export const EVENT_DOC_USER_DIRECTORY_GLOBAL = 'eventDocUserDirectory';

export const EVENT_DOC_ON_PUBLISH_GLOBAL = 'eventDocOnPublish';

export const EVENT_DOC_ON_APPEND_GLOBAL = 'eventDocOnAppend';

export const EVENT_DOC_SCOPE_RESOLVER_GLOBAL = 'eventDocScopeResolver';

export const EVENT_DOC_STORAGE_DRIVE_GLOBAL = 'eventDocStorageDrive';
