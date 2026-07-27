import { askNetworkRequest, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

const BUNDLE_CONTENT_TYPE = 'application/json';

// PUT the operator's file straight at the presigned url. The bytes go browser -> drive without
// passing through the api, and the Content-Type must match what the presign was minted with.
export function* askEventDocBundleUpload(uploadUrl: string, file: File): AskResponse<void> {
  const response = yield* askNetworkRequest('PUT', uploadUrl, {
    body: file,
    headers: { 'Content-Type': BUNDLE_CONTENT_TYPE },
    responseType: 'text',
  });

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Bundle upload failed (${response.status})`);
  }
}
