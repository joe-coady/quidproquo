// What POST /transfer/upload hands the browser: a presigned PUT for the bundle file plus the
// key to quote back to plan/import. The bytes never pass through the API, so bundle size is not
// bounded by a request payload limit.
export type EventDocTransferUploadTarget = {
  uploadUrl: string;
  transferId: string;
};
