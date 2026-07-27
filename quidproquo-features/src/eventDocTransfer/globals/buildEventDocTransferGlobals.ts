import { EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL, EVENT_DOC_TRANSFER_SCOPE_RESOLVER_GLOBAL, EVENT_DOC_TRANSFER_SERVICE_GLOBAL } from '../constants';
import { EventDocTransferCollection } from '../models';

export type EventDocTransferGlobalsOptions = {
  service: string;
  collections: EventDocTransferCollection[];
  scopeResolver?: string;
};

// THE single source for the transfer routes' globals, mirroring buildEventDocStoreGlobals. The
// whole registry travels as one global: the transfer needs every collection at once (a manifest
// crosses them), so per-store globals could not express it. Optional fields are always set (empty
// when unconfigured) so the bridge can read unconditionally.
export const buildEventDocTransferGlobals = ({ service, collections, scopeResolver }: EventDocTransferGlobalsOptions): Record<string, unknown> => ({
  [EVENT_DOC_TRANSFER_SERVICE_GLOBAL]: service,
  [EVENT_DOC_TRANSFER_COLLECTIONS_GLOBAL]: collections.map(({ storeName, type, onPublish, onAppend, referenceResolver }) => ({
    storeName,
    type,
    onPublish: onPublish ?? '',
    onAppend: onAppend ?? '',
    referenceResolver: referenceResolver ?? '',
  })),
  [EVENT_DOC_TRANSFER_SCOPE_RESOLVER_GLOBAL]: scopeResolver ?? '',
});
