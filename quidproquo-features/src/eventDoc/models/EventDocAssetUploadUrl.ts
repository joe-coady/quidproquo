// Result of requesting an upload slot for an immutable EventDoc asset. The client PUTs
// the bytes to `uploadUrl`, then records `assetId` (the guid that names the blob) in a
// domain event (e.g. SET_FONT_BLOB_GUID). The blob lives at `<docId>/assets/<assetId>`.
export type EventDocAssetUploadUrl = {
  uploadUrl: string;
  assetId: string;
};
