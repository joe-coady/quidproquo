import { askKeyValueStoreQuery, AskResponse, kvsAnd, kvsEqual, kvsGreaterThan, QpqPagedData } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';
import { eventDocStoredEventToEvent } from './storedEvent/eventDocStoredEventToEvent';
import { askEventDocResolveScope } from './askEventDocResolveScope';

export type EventDocEventListOptions = {
  limit?: number;
  // Read the writer's own most recent appends. Needed by a caller that appended and is now folding to
  // decide something; not needed by a viewer. Costs twice the read capacity, so it stays opt-in.
  consistentRead?: boolean;
  nextPageKey?: string;
  // Return only events whose log id is greater than this (exclusive) — the tail since a known
  // point, for an incremental refresh. The events store is keyed pk=modelId / sk=index on its
  // primary key, so this is a sort-key range condition (no GSI involved).
  afterEventId?: string;
};

export function* askEventDocEventList(modelId: string, options?: EventDocEventListOptions): AskResponse<QpqPagedData<EventDocEvent>> {
  const { eventsStoreName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  const keyCondition =
    options?.afterEventId !== undefined ? kvsAnd([kvsEqual('pk', modelId), kvsGreaterThan('sk', options.afterEventId)]) : kvsEqual('pk', modelId);

  const page = yield* askKeyValueStoreQuery<EventDocStoredEvent>(eventsStoreName, keyCondition, {
    sortAscending: true,
    limit: options?.limit,
    nextPageKey: options?.nextPageKey,
    consistentRead: options?.consistentRead,
    scope,
  });

  return {
    nextPageKey: page.nextPageKey,
    items: page.items.map((record) => eventDocStoredEventToEvent(record)),
  };
}
