import { askFileGenerateTemporaryUploadSecureUrl, askNewGuid, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetUploadUrl } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';
import { eventDocAssetPath } from './eventDocAssetPath';

const ASSET_UPLOAD_TTL_MS = 5 * 60 * 1000;

// One complete storage operation: mint a guid + a presigned PUT url the client uploads the bytes to.
// Returns the guid (assetId) so the caller can record it in a domain event. An optional
// contentDisposition is baked into the upload (the client must PUT the matching header) so the stored
// object serves with it — e.g. 'inline' so a rendered PDF previews in an <iframe> instead of downloading.
export function* askEventDocGenerateAssetUploadUrl(
  docId: string,
  contentType: string,
  contentDisposition?: string,
): AskResponse<EventDocAssetUploadUrl> {
  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const assetId = yield* askNewGuid();

  const uploadUrl = yield* askFileGenerateTemporaryUploadSecureUrl(
    storageDriveName,
    eventDocAssetPath(docId, assetId),
    ASSET_UPLOAD_TTL_MS,
    { contentType, contentDisposition },
    scope,
  );

  return { uploadUrl, assetId };
}
