import { askKeyValueStoreUpdate, AskResponse, KvsAdvancedDataType, kvsRemove, kvsSet } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocSummary, EventDocSummaryView } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';

// Persist a folded summary view as the queryable record. Writes FIELDS rather than a
// whole record: `type` and `id` are the store's partition/sort keys and are never
// written as attributes, and writing only what the fold produces keeps this honest
// about the record being nothing but a projection.
//
// `deletedAt` is set-or-REMOVED, never skipped: RESTORE clears it from the view, and
// the list read hides deleted rows by attribute existence (kvsNotExists), so leaving a
// stale `deletedAt` behind would hide a restored document forever.
export function* askEventDocSummaryViewWrite(modelId: string, view: EventDocSummaryView): AskResponse<void> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  yield* askKeyValueStoreUpdate<EventDocSummary>(
    storeName,
    [
      kvsSet('code', view.code),
      kvsSet('name', view.name),
      kvsSet('createdAt', view.createdAt),
      kvsSet('createdBy', view.createdBy),
      kvsSet('updatedAt', view.updatedAt),
      kvsSet('updatedBy', view.updatedBy),
      view.deletedAt !== undefined ? kvsSet('deletedAt', view.deletedAt) : kvsRemove('deletedAt'),
      // Cast: `versions` is a list of maps, which the marshaller writes correctly
      // (buildAttributeValue recurses), but a zod-inferred object type carries no implicit
      // index signature, so it will not structurally match KvsObjectDataType.
      kvsSet('versions', view.versions as unknown as KvsAdvancedDataType),
    ],
    type,
    modelId,
    { scope },
  );
}
