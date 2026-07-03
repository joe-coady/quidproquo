import { AskResponse, askThrowError, ErrorTypeEnum } from 'quidproquo-core';

import { EventDocStore } from '../types/EventDocStore';
import { askEventDocStoreRead } from './askEventDocStoreRead';

// Throw if unprovided: a QPQ context read otherwise silently returns the empty default.
export function* askEventDocResolveStore(): AskResponse<EventDocStore> {
  const store = yield* askEventDocStoreRead();

  if (!store.storeName || !store.type) {
    return yield* askThrowError(
      ErrorTypeEnum.GenericError,
      'EventDoc store context was not provided. Wrap the call in askEventDocStoreProvide({ storeName, type }, ...).'
    );
  }

  return store;
}
