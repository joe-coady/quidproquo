// Per-route globals the transfer controllers read back (see buildEventDocTransferGlobals).
// The registry rides along as a global rather than being re-declared per controller, so one
// collection array in the service's infrastructure feeds both defineEventDoc and the transfer.
export const EVENT_DOC_TRANSFER_SERVICE_GLOBAL = 'eventDocTransferService';
export const EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL = 'eventDocTransferCollections';
export const EVENT_DOC_TRANSFER_SCOPE_RESOLVER_GLOBAL = 'eventDocTransferScopeResolver';
