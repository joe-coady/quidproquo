import { askKeyValueStoreDelete, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { askEventDocResolveScope } from './askEventDocResolveScope';

// Hard delete — internal cleanup/admin only; the public lifecycle uses soft
// delete (`askEventDocSoftDelete`).
export function* askEventDocDelete(id: string): AskResponse<void> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  yield* askKeyValueStoreDelete(storeName, type, id, { scope });
}
