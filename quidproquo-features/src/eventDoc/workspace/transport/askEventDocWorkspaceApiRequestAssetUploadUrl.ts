import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';
import { askApiRequest } from 'quidproquo-webserver';

import { EventDocAssetUploadUrl } from '../../models';
import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { eventDocWorkspaceAssetsEndpoint } from './eventDocWorkspaceAssetsEndpoint';

type AssetUploadUrlRequest = { contentType: string };

// Ask the collection's asset endpoint for a presigned PUT url + the guid (assetId)
// that will name the immutable blob. The caller PUTs the bytes to `uploadUrl`, then
// records `assetId` via a domain event (e.g. SET_FONT_BLOB_GUID).
export function* askEventDocWorkspaceApiRequestAssetUploadUrl(
  identity: EventDocWorkspaceDocumentIdentity,
  contentType: string,
): AskResponse<EventDocAssetUploadUrl> {
  const response = yield* askApiRequest<AssetUploadUrlRequest, EventDocAssetUploadUrl>(
    identity.serviceName,
    'POST',
    eventDocWorkspaceAssetsEndpoint(identity),
    { body: { contentType } },
  );

  if (response.status < 200 || response.status >= 300) {
    return yield* askThrowError(ErrorTypeEnum.GenericError, `Failed to request asset upload url (${response.status})`);
  }

  return response.data;
}
