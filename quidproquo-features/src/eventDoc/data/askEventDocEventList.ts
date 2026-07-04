import { askKeyValueStoreQuery, AskResponse, kvsAnd, kvsEqual, kvsGreaterThan, QpqPagedData } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { EventDocStoredEvent } from '../types/EventDocStoredEvent';
import { eventDocStoredEventToEvent } from './storedEvent/eventDocStoredEventToEvent';

export type EventDocEventListOptions = {
  limit?: number;
  nextPageKey?: string;
  // Return only events whose log index is greater than this (exclusive) — the tail since a known
  // point, for an incremental refresh. The events store is keyed pk=modelId / sk=index on its
  // primary key, so this is a sort-key range condition (no GSI involved).
  afterIndex?: number;
};

export function* askEventDocEventList(modelId: string, options?: EventDocEventListOptions): AskResponse<QpqPagedData<EventDocEvent>> {
  const { eventsStoreName } = yield* askEventDocResolveStore();

  const keyCondition =
    options?.afterIndex !== undefined ? kvsAnd([kvsEqual('pk', modelId), kvsGreaterThan('sk', options.afterIndex)]) : kvsEqual('pk', modelId);

  const page = yield* askKeyValueStoreQuery<EventDocStoredEvent>(eventsStoreName, keyCondition, {
    sortAscending: true,
    limit: options?.limit,
    nextPageKey: options?.nextPageKey,
  });

  return {
    nextPageKey: page.nextPageKey,
    items: page.items.map((record) => eventDocStoredEventToEvent(record)),
  };
}
