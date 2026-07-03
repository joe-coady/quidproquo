import { askKeyValueStoreQuery, AskResponse, kvsEqual } from 'quidproquo-core';
import { Nullable } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';
import { eventDocStoredEventToEvent } from './storedEvent/eventDocStoredEventToEvent';

// Tail of the log, used to assign the next index, dedup, and validate. Relies on
// numeric sort-key ordering: the dev-server sorts numeric sort keys numerically
// (matching DynamoDB), so this returns the true latest.
export function* askEventDocEventLast(
  modelId: string
): AskResponse<Nullable<EventDocEvent>> {
  const { eventsStoreName } = yield* askEventDocResolveStore();

  const page = yield* askKeyValueStoreQuery<EventDocStoredEvent>(
    eventsStoreName,
    kvsEqual('pk', modelId),
    { sortAscending: false, limit: 1 }
  );

  const record = page.items[0];
  return record ? eventDocStoredEventToEvent(record) : null;
}
