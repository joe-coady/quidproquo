import { askFileGenerateTemporarySecureUrl, AskResponse } from 'quidproquo-core';

import { eventDocStorageDriveName } from '../../eventDoc/constants/eventDocStorageDriveName';
import { eventDocAssetPath } from '../../eventDoc/data/eventDocAssetPath';
import { EventDocAssetDownloadUrl } from '../../eventDoc/models';
import { TENANT_EVENTDOC_STORE } from '../constants/tenantStoreNames';

const LOGO_DOWNLOAD_TTL_MS = 15 * 60 * 1000;

// One complete storage operation: presign a short-lived read URL for a tenant logo
// blob. The blob lives in the tenant collection's own drive under the doc's home
// scope (passed in from the registry record), NOT the reader's ambient scope — this
// is the registry-mediated cross-scope read path, so it never resolves scope itself.
export function* askTenantLogoDownloadUrl(tenantId: string, assetId: string, scope: string): AskResponse<EventDocAssetDownloadUrl> {
  const url = yield* askFileGenerateTemporarySecureUrl(
    eventDocStorageDriveName(TENANT_EVENTDOC_STORE),
    eventDocAssetPath(tenantId, assetId),
    LOGO_DOWNLOAD_TTL_MS,
    scope,
  );

  return { url };
}
