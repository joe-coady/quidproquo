import { askKeyValueStoreQuery, AskResponse, kvsEqual } from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';
import { eventDocStoredEventToEvent } from './storedEvent/eventDocStoredEventToEvent';
import { askEventDocResolveScope } from './askEventDocResolveScope';

// Tail of the log — the newest event by sort key. Event ids are sortable guids, so
// lexicographic sort-key order (DynamoDB's, and the dev-server's for strings) is
// creation order and this returns the true latest.
export function* askEventDocEventLast(modelId: string): AskResponse<Nullable<EventDocEvent>> {
  const { eventsStoreName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const page = yield* askKeyValueStoreQuery<EventDocStoredEvent>(eventsStoreName, kvsEqual('pk', modelId), {
    sortAscending: false,
    limit: 1,
    scope,
  });

  const record = page.items[0];
  return record ? eventDocStoredEventToEvent(record) : null;
}
