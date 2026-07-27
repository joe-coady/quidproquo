import { askFileGenerateTemporaryUploadSecureUrl, askNewGuid, AskResponse } from 'quidproquo-core';

import { askEventDocResolveScope } from '../../eventDoc/data';
import { EVENT_DOC_TRANSFER_DRIVE_NAME, eventDocTransferImportPath } from '../constants';
import { EventDocTransferUploadTarget } from '../models';

const BUNDLE_UPLOAD_TTL_MS = 10 * 60 * 1000;

/**
 * Mint a presigned PUT for an incoming bundle plus the id to quote back to plan/import. The bytes
 * go browser -> drive directly, so a bundle is never bounded by an API request payload limit.
 */
export function* askEventDocTransferUploadTarget(): AskResponse<EventDocTransferUploadTarget> {
  const scope = yield* askEventDocResolveScope();
  const transferId = yield* askNewGuid();

  const uploadUrl = yield* askFileGenerateTemporaryUploadSecureUrl(
    EVENT_DOC_TRANSFER_DRIVE_NAME,
    eventDocTransferImportPath(transferId),
    BUNDLE_UPLOAD_TTL_MS,
    { contentType: 'application/json' },
    scope,
  );

  return { uploadUrl, transferId };
}
