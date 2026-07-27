import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION } from '../constants';
import { EventDocBundle, EventDocBundleApplyOptions, EventDocTransferPlanRow, EventDocTransferRegistry } from '../models';
import { askEventDocBundleApplyDoc } from './askEventDocBundleApplyDoc';
import { askEventDocTransferProvideCollection } from './askEventDocTransferProvideCollection';

/**
 * Import every doc in the bundle, in bundle order (leaves-first, as the export emitted it), and
 * report what happened per doc in the same shape the plan returns.
 *
 * Docs are independent: a blocking row (diverged, code conflict) is reported and the rest still
 * land. That is deliberate - the alternative, aborting the whole bundle, would mean one
 * hand-edited doc in the target blocks every unrelated promotion. Every write is conditional on
 * (docId, index) or on an absent asset guid, so re-running after fixing the blocker is safe.
 */
export function* askEventDocBundleApply(
  registry: EventDocTransferRegistry,
  bundle: EventDocBundle,
  options: EventDocBundleApplyOptions,
): AskResponse<EventDocTransferPlanRow[]> {
  if (bundle.formatVersion !== EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION) {
    return yield* askThrowError(
      ErrorTypeEnum.BadRequest,
      `Bundle format version ${bundle.formatVersion} is not supported (this deployment reads version ${EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION}).`,
    );
  }

  const rows: EventDocTransferPlanRow[] = [];

  for (const doc of bundle.docs) {
    rows.push(yield* askEventDocTransferProvideCollection(registry, doc, askEventDocBundleApplyDoc(doc, options)));
  }

  return rows;
}
