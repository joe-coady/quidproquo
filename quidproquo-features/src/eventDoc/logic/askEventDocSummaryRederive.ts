import { askKeyValueStoreUpdate, AskResponse, KvsAdvancedDataType, kvsSet } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocEventListAll } from '../data/askEventDocEventListAll';
import { askEventDocResolveScope } from '../data/askEventDocResolveScope';
import { EventDocSummary } from '../models';
import { foldEventDocSummary } from '../summary/foldEventDocSummary';

// Re-derive the queryable record from the log after a RESERVED lifecycle event
// (INIT_STATE / SET_CODE / SET_NAME / CREATE_DRAFT / PUBLISH). Those restructure the record
// — identity, version history — so no field-level update expresses them.
//
// Re-deriving, rather than applying the event to the stored record, is what makes this
// correct now that the fold is the gate: foldEventDocSummary sees only ACCEPTED events, so
// an event the fold rejects contributes nothing. The old incremental applier folded every
// event in regardless of whether it was valid.
//
// It is also why the old path was the last concurrent-write hazard on the append: read the
// record, apply, put the whole record back is a read-modify-write, and it never errored, it
// silently clobbered. Reserved events are rare and effectively single-writer (a person
// publishes a document), so the log read is affordable here.
//
// Writes FIELDS rather than a whole record. `type` and `id` are the store's partition/sort
// keys and are never written as attributes, and writing only what the fold produces keeps
// this honest about the record being nothing but a projection.
//
// This goes away entirely once the stream projector lands: deriving the read model is the
// projector's job, and nothing about it belongs on the write path.
export function* askEventDocSummaryRederive(modelId: string): AskResponse<void> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const events = yield* askEventDocEventListAll(modelId);
  const record = foldEventDocSummary(type, events);

  yield* askKeyValueStoreUpdate<EventDocSummary>(
    storeName,
    [
      kvsSet('code', record.code),
      kvsSet('name', record.name),
      kvsSet('createdAt', record.createdAt),
      kvsSet('createdBy', record.createdBy),
      kvsSet('updatedAt', record.updatedAt),
      kvsSet('updatedBy', record.updatedBy),
      // Cast: `versions` is a list of maps, which the marshaller writes correctly
      // (buildAttributeValue recurses), but a zod-inferred object type carries no implicit
      // index signature, so it will not structurally match KvsObjectDataType.
      kvsSet('versions', record.versions as unknown as KvsAdvancedDataType),
    ],
    type,
    modelId,
    { scope },
  );
}
