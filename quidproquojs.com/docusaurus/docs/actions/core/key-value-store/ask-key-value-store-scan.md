---
title: askKeyValueStoreScan
description: Scan a page of records across an entire key-value store, optionally filtered.
---

# askKeyValueStoreScan

Reads a page of records from a [key-value store](../../../config/core/key-value-store.md) **without** a key condition — it walks the whole table, optionally applying a filter to every record. Unlike [askKeyValueStoreQuery](./ask-key-value-store-query.md), a scan reads across all partitions, so it is more expensive; use it only when you cannot address records by key.

- **Action type:** `KeyValueStoreActionType.Scan`

```typescript
import { askKeyValueStoreScan, kvsEqual } from 'quidproquo-core';

interface User {
  userId: string;
  status: string;
}

export function* askFirstPageOfSuspendedUsers() {
  const page = yield* askKeyValueStoreScan<User>('users', kvsEqual('status', 'suspended'));
  return page.items; // User[]
}
```

## Signature

```typescript
function* askKeyValueStoreScan<KvsItem>(
  keyValueStoreName: string,
  filterCondition?: KvsQueryOperation,
  nextPageKey?: string,
): AskResponse<QpqPagedData<KvsItem>>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `keyValueStoreName` | `string` | Name of the store to scan — must match a store declared with [defineKeyValueStore](../../../config/core/key-value-store.md) (or one shared via its `owner` option). |
| `filterCondition` | `KvsQueryOperation` | Optional filter applied to every scanned record. Built with the `kvs*` condition helpers — see [Query conditions](./ask-key-value-store-query.md#query-conditions-kvsqueryoperation). Omit it to return everything. |
| `nextPageKey` | `string` | Opaque cursor from a previous page's `nextPageKey`; pass it to fetch the following page. |

## Returns

`QpqPagedData<KvsItem>` — one page of results:

```typescript
interface QpqPagedData<T> {
  items: T[];
  nextPageKey?: string; // present when more pages remain
}
```

When `nextPageKey` is set, pass it back as the third argument to fetch the next page. To drain every page in one call, use [askKeyValueStoreScanAll](./ask-key-value-store-scan-all.md).

## Errors

| Error | Meaning |
| --- | --- |
| `KeyValueStoreScanErrorTypeEnum.ServiceUnavailable` | DynamoDB internal error or throttling. |
| `KeyValueStoreScanErrorTypeEnum.ResourceNotFound` | The underlying table does not exist. |

Catch errors with `askCatch` — it returns `{ success: true, result }` or `{ success: false, error }`.

## Related

- [defineKeyValueStore](../../../config/core/key-value-store.md) — declares the store being scanned.
- [askKeyValueStoreScanAll](./ask-key-value-store-scan-all.md) — loop all pages into a single array.
- [askKeyValueStoreQuery](./ask-key-value-store-query.md) — the cheaper, key-addressed alternative.
- [askKeyValueStoreGetAll](./ask-key-value-store-get-all.md) — read every record with no filter.
