// Key layout of an eventDoc asset blob in the collection's storage drive:
// `<docId>/assets/<assetId>` — guid-named so a re-upload is always a fresh blob
// (immutable; the old one stays addressable for history/rollback). The sibling
// `<docId>/runtime/<...>` prefix (derived, disposable artifacts) is written by
// generation, not here. Swapping this scheme touches only this file.
export const eventDocAssetPath = (docId: string, assetId: string): string => `${docId}/assets/${assetId}`;
