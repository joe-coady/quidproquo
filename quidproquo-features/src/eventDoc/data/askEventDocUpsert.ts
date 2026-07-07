import { askKeyValueStoreUpsertWithRetry, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocSummary } from '../models';

// Bare storage write; business rules and validation live in the logic layer.
export function* askEventDocUpsert(model: EventDocSummary): AskResponse<void> {
  const { storeName } = yield* askEventDocResolveStore();

  yield* askKeyValueStoreUpsertWithRetry(storeName, model);
}
