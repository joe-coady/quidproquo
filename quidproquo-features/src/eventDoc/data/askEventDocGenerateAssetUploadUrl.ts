import { askFileGenerateTemporaryUploadSecureUrl, askNewGuid, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetUploadUrl } from '../models';
import { eventDocAssetPath } from './eventDocAssetPath';

const ASSET_UPLOAD_TTL_MS = 5 * 60 * 1000;

// One complete storage operation: mint a guid + a presigned PUT url the client uploads
// the bytes to. Returns the guid (assetId) so the caller can record it in a domain event.
export function* askEventDocGenerateAssetUploadUrl(docId: string, contentType: string): AskResponse<EventDocAssetUploadUrl> {
  const { storageDriveName } = yield* askEventDocResolveStore();

  const assetId = yield* askNewGuid();

  const uploadUrl = yield* askFileGenerateTemporaryUploadSecureUrl(storageDriveName, eventDocAssetPath(docId, assetId), ASSET_UPLOAD_TTL_MS, {
    contentType,
  });

  return { uploadUrl, assetId };
}
