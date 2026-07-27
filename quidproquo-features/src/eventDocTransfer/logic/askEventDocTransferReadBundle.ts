import { askFileReadObjectJson, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askEventDocResolveScope } from '../../eventDoc/data';
import { EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION, EVENT_DOC_TRANSFER_DRIVE_NAME, eventDocTransferImportPath } from '../constants';
import { EventDocBundle } from '../models';

/**
 * Read an uploaded bundle back off the transfer drive, and refuse a format this deployment does not
 * read. The single door both plan and import come through, so a bad file is rejected once, before
 * any doc is looked at.
 */
export function* askEventDocTransferReadBundle(transferId: string): AskResponse<EventDocBundle> {
  const scope = yield* askEventDocResolveScope();

  const bundle = yield* askFileReadObjectJson<EventDocBundle>(EVENT_DOC_TRANSFER_DRIVE_NAME, eventDocTransferImportPath(transferId), scope);

  if (bundle.formatVersion !== EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION) {
    return yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      `Bundle format version ${bundle.formatVersion} is not supported (this deployment reads version ${EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION}).`,
    );
  }

  return bundle;
}
