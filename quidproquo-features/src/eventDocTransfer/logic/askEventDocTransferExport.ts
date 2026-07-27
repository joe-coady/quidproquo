import { askFileGenerateTemporarySecureUrl, askFileWriteObjectJson, askNewGuid, AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { askEventDocResolveScope } from '../../eventDoc/data';
import { EVENT_DOC_TRANSFER_DRIVE_NAME, eventDocTransferBundleFilename, eventDocTransferExportPath } from '../constants';
import { EventDocDocRef, EventDocTransferExportResult, EventDocTransferRegistry } from '../models';
import { askEventDocBundleBuild } from './askEventDocBundleBuild';
import { askEventDocManifest } from './askEventDocManifest';

const BUNDLE_DOWNLOAD_TTL_MS = 15 * 60 * 1000;

/**
 * Export one or more docs and everything they reference as ONE staged bundle, and hand back a
 * short-lived download link plus the manifest it covers (so the UI can show exactly what went in,
 * including the soft-deleted docs that were reported but skipped).
 *
 * Selecting several docs at once is the point of taking a list: their manifests are merged and
 * deduped, so a stylesheet three templates share travels once, not three times.
 *
 * The manifest comes back in discovery order (the starting doc first), and the bundle is written in
 * REVERSE, which is leaves-first: whatever the target imports, a referenced doc lands before the doc
 * that points at it.
 */
export function* askEventDocTransferExport(registry: EventDocTransferRegistry, starts: EventDocDocRef[]): AskResponse<EventDocTransferExportResult> {
  if (starts.length === 0) {
    return yield* askThrowError(ErrorTypeEnum.BadRequest, 'Nothing selected to export.');
  }

  const items = yield* askEventDocManifest(registry, starts);
  const roots = items.filter((item) => item.depth === 0);
  const deletedRoot = roots.find((item) => item.deleted);

  // A dependency that is deleted at source is reported and skipped, but a doc the operator
  // explicitly picked is a mistake worth stopping on rather than quietly dropping.
  if (deletedRoot) {
    return yield* askThrowError(ErrorTypeEnum.BadRequest, `Doc ${deletedRoot.id} is deleted and cannot be exported.`);
  }

  const exportable: EventDocDocRef[] = [...items]
    .reverse()
    .filter((item) => !item.deleted)
    .map(({ service, type, id }) => ({ service, type, id }));

  const bundle = yield* askEventDocBundleBuild(registry, exportable);

  const scope = yield* askEventDocResolveScope();
  const transferId = yield* askNewGuid();
  const filepath = eventDocTransferExportPath(transferId);

  yield* askFileWriteObjectJson(EVENT_DOC_TRANSFER_DRIVE_NAME, filepath, bundle, undefined, scope);

  const downloadUrl = yield* askFileGenerateTemporarySecureUrl(EVENT_DOC_TRANSFER_DRIVE_NAME, filepath, BUNDLE_DOWNLOAD_TTL_MS, scope);

  return {
    downloadUrl,
    filename: eventDocTransferBundleFilename(roots[0].type, roots[0].code, bundle.source.exportedAt, roots.length),
    items,
  };
}
