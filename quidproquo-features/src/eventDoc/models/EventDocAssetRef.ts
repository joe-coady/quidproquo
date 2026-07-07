// A first-class reference to an immutable EventDoc asset blob: the guid that names it
// (`<docId>/assets/<guid>` in the collection's storage drive) plus its original filename
// + mimetype. Recorded in a domain event (e.g. a font face or an image) so the document
// points at the bytes without embedding them. A re-upload writes a new guid, so prior
// refs stay addressable for history/rollback.
export type EventDocAssetRef = {
  guid: string;
  filename: string;
  mimetype: string;
};
