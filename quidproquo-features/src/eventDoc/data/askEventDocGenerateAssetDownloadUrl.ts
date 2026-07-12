import { askFileGenerateTemporarySecureUrl, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocAssetDownloadUrl } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';
import { eventDocAssetPath } from './eventDocAssetPath';

const ASSET_DOWNLOAD_TTL_MS = 15 * 60 * 1000;

// One complete storage operation: a short-lived presigned GET url the client loads the
// asset bytes from (e.g. an <img src>, or to build a data URL). Read-only, no mutation.
export function* askEventDocGenerateAssetDownloadUrl(docId: string, assetId: string): AskResponse<EventDocAssetDownloadUrl> {
  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const url = yield* askFileGenerateTemporarySecureUrl(storageDriveName, eventDocAssetPath(docId, assetId), ASSET_DOWNLOAD_TTL_MS, scope);

  return { url };
}
