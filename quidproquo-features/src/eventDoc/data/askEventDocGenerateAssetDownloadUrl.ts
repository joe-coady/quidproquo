import { askFileGenerateTemporarySecureUrl, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetDownloadUrl } from '../models';

const ASSET_DOWNLOAD_TTL_MS = 15 * 60 * 1000;

// Same key layout as the upload side: `<docId>/assets/<assetId>`.
const assetKey = (docId: string, assetId: string): string =>
  `${docId}/assets/${assetId}`;

// One complete storage operation: a short-lived presigned GET url the client loads the
// asset bytes from (e.g. an <img src>, or to build a data URL). Read-only, no mutation.
export function* askEventDocGenerateAssetDownloadUrl(
  docId: string,
  assetId: string
): AskResponse<EventDocAssetDownloadUrl> {
  const { storageDriveName } = yield* askEventDocResolveStore();

  const url = yield* askFileGenerateTemporarySecureUrl(
    storageDriveName,
    assetKey(docId, assetId),
    ASSET_DOWNLOAD_TTL_MS
  );

  return { url };
}
