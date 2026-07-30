import { askKeyValueStoreQuery, AskResponse, kvsEqual, kvsNotExists, QpqPagedData } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EVENT_DOC_LIST_PAGE_SIZE } from '../list/constants/eventDocListPageSize';
import { EventDocSummary } from '../models';
import { askEventDocResolveScope } from './askEventDocResolveScope';

export type EventDocListPageOptions = {
  includeDeleted?: boolean;
  limit?: number;
  nextPageKey?: string;
};

/**
 * ONE page of a collection, newest first, straight off the store.
 *
 * The paged counterpart to {@link askEventDocList}, which reads the ENTIRE partition, filters and sorts it
 * in memory, and returns all of it. That is fine for a handful of documents and untenable past a few
 * hundred: every list request costs read capacity proportional to the whole collection, holds it all in
 * Lambda memory, and ships it all over the wire for a client that renders ten rows. A few hundred flow
 * runs is enough to feel it.
 *
 * Ordering comes from the store, not from us. The summary table declares an index on
 * (type, updatedAt), so a descending query returns newest-first directly — which is what makes paging
 * possible at all. An in-memory sort cannot be paged: you would have to read everything to know what
 * belongs on page two.
 *
 * SOFT-DELETED documents are excluded with a query FILTER, and filters are applied after rows are read.
 * A page can therefore come back SHORT of `limit` while more pages remain. Callers must page on the
 * presence of `nextPageKey` and never on the item count, or they will stop early and silently hide
 * documents.
 */
export function* askEventDocListPage<T extends EventDocSummary = EventDocSummary>(options?: EventDocListPageOptions): AskResponse<QpqPagedData<T>> {
  const { storeName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  return yield* askKeyValueStoreQuery<T>(storeName, kvsEqual('type', type), {
    scope,
    limit: options?.limit ?? EVENT_DOC_LIST_PAGE_SIZE,
    nextPageKey: options?.nextPageKey,
    // Newest first, from the index, so the caller never sorts.
    sortAscending: false,
    filter: options?.includeDeleted ? undefined : kvsNotExists('deletedAt'),
  });
}
