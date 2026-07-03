import { askFileGenerateTemporaryUploadSecureUrl, askNewGuid, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetUploadUrl } from '../models';

const ASSET_UPLOAD_TTL_MS = 5 * 60 * 1000;

// Key layout: `<docId>/assets/<assetId>` — guid-named so a re-upload is always a fresh
// blob (immutable; the old one stays addressable for history/rollback). The sibling
// `<docId>/runtime/<...>` prefix (derived, disposable artifacts) is written by
// generation, not here. Swapping this scheme touches only this file.
const assetKey = (docId: string, assetId: string): string =>
  `${docId}/assets/${assetId}`;

// One complete storage operation: mint a guid + a presigned PUT url the client uploads
// the bytes to. Returns the guid (assetId) so the caller can record it in a domain event.
export function* askEventDocGenerateAssetUploadUrl(
  docId: string,
  contentType: string
): AskResponse<EventDocAssetUploadUrl> {
  const { storageDriveName } = yield* askEventDocResolveStore();

  const assetId = yield* askNewGuid();

  const uploadUrl = yield* askFileGenerateTemporaryUploadSecureUrl(
    storageDriveName,
    assetKey(docId, assetId),
    ASSET_UPLOAD_TTL_MS,
    { contentType }
  );

  return { uploadUrl, assetId };
}
