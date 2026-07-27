// One collection the transfer feature is allowed to read and write, as registered by
// defineEventDocTransfer. Structurally a subset of EventDocRoutesOptions, so a service can
// declare its collections ONCE and feed the same array to both defineEventDoc and the
// transfer (extra fields like basePath are ignored here: the backend never goes over HTTP,
// it provides the store in process).
export type EventDocTransferCollection = {
  storeName: string;
  type: string;
  // Hook names are carried so a provided store behaves exactly as it does on the collection's
  // own routes: onPublish/onAppend fire after an import, and referenceResolver drives the
  // manifest walk. eventValidator is deliberately NOT applied to imported events (replayed
  // history was already validated at its origin).
  onPublish?: string;
  onAppend?: string;
  referenceResolver?: string;
};
