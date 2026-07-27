import { askConfigGetApplicationInfo, askDateNow, askFileReadBinaryContents, AskResponse, QpqIsoDateTime } from 'quidproquo-core';

import { askEventDocResolveStore } from '../../eventDoc/context';
import { askEventDocEventListAll, askEventDocListAssets, askEventDocResolveScope, eventDocAssetPath } from '../../eventDoc/data';
import { EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION } from '../constants';
import { EventDocBundle, EventDocBundleAsset, EventDocBundleDoc, EventDocDocRef, EventDocTransferRegistry } from '../models';
import { askEventDocTransferProvideCollection } from './askEventDocTransferProvideCollection';

// One doc's contents, read inside its own collection's store. Assets are pulled by value: the
// bundle has to be self-contained, since the target environment cannot reach this drive.
function* askEventDocBundleReadDoc(ref: EventDocDocRef): AskResponse<EventDocBundleDoc> {
  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const events = yield* askEventDocEventListAll(ref.id);
  const assetIds = yield* askEventDocListAssets(ref.id);

  const assets: EventDocBundleAsset[] = [];

  for (const guid of assetIds) {
    const data = yield* askFileReadBinaryContents(storageDriveName, eventDocAssetPath(ref.id, guid), scope);
    assets.push({ guid, data });
  }

  return { ...ref, events, assets };
}

/**
 * Build a bundle for an exact set of docs (normally a manifest). Events travel verbatim and no
 * summary travels at all: the target rebuilds it by folding, so an import cannot carry a stale
 * derived record.
 */
export function* askEventDocBundleBuild(registry: EventDocTransferRegistry, refs: EventDocDocRef[]): AskResponse<EventDocBundle> {
  const applicationInfo = yield* askConfigGetApplicationInfo();
  const exportedAt = (yield* askDateNow()) as QpqIsoDateTime;

  const docs: EventDocBundleDoc[] = [];

  for (const ref of refs) {
    docs.push(yield* askEventDocTransferProvideCollection(registry, ref, askEventDocBundleReadDoc(ref)));
  }

  return {
    formatVersion: EVENT_DOC_TRANSFER_BUNDLE_FORMAT_VERSION,
    source: {
      application: applicationInfo.name,
      environment: applicationInfo.environment,
      exportedAt,
    },
    docs,
  };
}
