import { askFileWriteBinaryContents, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../../eventDoc/context';
import { askEventDocListAssets, askEventDocResolveScope, eventDocAssetPath } from '../../eventDoc/data';
import { EventDocBundleAsset } from '../models';

/**
 * Copy a bundle's asset blobs into this collection's drive at their ORIGINAL guids, so the
 * EventDocAssetRefs recorded in the doc's events keep resolving. Assets are immutable and
 * guid-named, so "already present" is the entire staleness check and a re-run writes nothing.
 * Assumes the collection's store is provided.
 */
export function* askEventDocTransferWriteAssets(docId: string, assets: EventDocBundleAsset[]): AskResponse<number> {
  if (assets.length === 0) {
    return 0;
  }

  const { storageDriveName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const existing = yield* askEventDocListAssets(docId);
  const missing = assets.filter((asset) => !existing.includes(asset.guid));

  for (const asset of missing) {
    yield* askFileWriteBinaryContents(storageDriveName, eventDocAssetPath(docId, asset.guid), asset.data, undefined, scope);
  }

  return missing.length;
}
