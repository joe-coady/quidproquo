import { askKeyValueStoreUpsertWithRetry, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocSummaryView } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';

// Bare storage write; business rules and validation live in the logic layer.
//
// Takes the summary VIEW and stamps `type` on the way in. `type` is the store's partition
// key (and its GSI's), so the item has to carry it — but that is a fact about this table,
// not about the projection, and callers already had to resolve the store to get here. The
// logic layer hands over what it folded and never names a storage key.
export function* askEventDocUpsert(view: EventDocSummaryView): AskResponse<void> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  yield* askKeyValueStoreUpsertWithRetry(storeName, { ...view, type }, { scope });
}
