import { askKeyValueStoreQuery, AskResponse, kvsAnd, kvsEqual, kvsGreaterThan, kvsLessThanOrEqual, QpqPagedData } from 'quidproquo-core';

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
  // Return only events whose log id is at or before this (inclusive) — the PREFIX up to a known
  // event, for folding the document as of that event (a snapshot). NOT combinable with
  // afterEventId: a DynamoDB key condition permits one condition per key, so a two-ended range
  // would need kvsBetween — whose inclusive lower bound cannot express afterEventId's exclusive
  // one. No caller wants both today; the guard keeps the failure loud if one ever tries.
  upToEventId?: string;
};

export function* askEventDocEventList(modelId: string, options?: EventDocEventListOptions): AskResponse<QpqPagedData<EventDocEvent>> {
  const { eventsStoreName } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  if (options?.afterEventId !== undefined && options?.upToEventId !== undefined) {
    throw new Error('askEventDocEventList: afterEventId and upToEventId cannot be combined - a key condition holds one sort-key range.');
  }

  const rangeCondition =
    options?.afterEventId !== undefined
      ? kvsGreaterThan('sk', options.afterEventId)
      : options?.upToEventId !== undefined
        ? kvsLessThanOrEqual('sk', options.upToEventId)
        : undefined;

  const keyCondition = rangeCondition ? kvsAnd([kvsEqual('pk', modelId), rangeCondition]) : kvsEqual('pk', modelId);

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
