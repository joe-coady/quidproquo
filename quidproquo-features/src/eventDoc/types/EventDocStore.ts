// Per-collection identity resolved from context, so call sites pass only the
// variable args (id, name, blobId), never the store name or type. `type` pins
// the collection within a store that can hold several.
export type EventDocStore = {
  storeName: string;
  eventsStoreName: string;
  type: string;
  // The collection's blob bucket (assets + runtime artifacts), keyed per-doc.
  storageDriveName: string;
  // The collection's append-time validator inline-function name, if configured.
  eventValidator?: string;
  // The collection's render inline-function name, if configured (powers GET .../render).
  eventRenderer?: string;
  // The collection's on-publish inline-function name, if configured. Invoked after a
  // Publish event has been durably appended and the summary re-derived.
  onPublish?: string;
  // The collection's on-append inline-function name, if configured. Invoked after EVERY
  // event (lifecycle included) has been durably appended and the summary re-derived.
  onAppend?: string;
  // The collection's request-scope inline-function name, if configured. Invoked with the
  // HTTP event; a non-null result becomes the ambient storage scope for the request.
  scopeResolver?: string;
};
