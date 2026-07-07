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
};
