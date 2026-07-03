// Result of requesting read access to an immutable EventDoc asset: a short-lived
// presigned GET url the client can load the bytes from (e.g. an <img src> or to build a
// data URL). Lives only a few minutes — re-request when needed.
export type EventDocAssetDownloadUrl = {
  url: string;
};
