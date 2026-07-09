---
title: askKeyValueStoreQuerySingle
description: Query a key-value store and return the first matching record, or null.
---

# askKeyValueStoreQuerySingle

Runs [askKeyValueStoreQuery](./ask-key-value-store-query.md) and returns the **first** matching record, or `null` if there are none. Convenient for "find one" lookups — for example resolving a record by a unique attribute on a secondary index.

- **Built from:** [askKeyValueStoreQuery](./ask-key-value-store-query.md), paging until at least `limit` records are collected, then returning the first. It is a helper story, not a distinct action.

```typescript
import { askKeyValueStoreQuerySingle, kvsEqual } from 'quidproquo-core';

interface User {
  userId: string;
  email: string;
}

export function* askFindUserByEmail(email: string) {
  const user = yield* askKeyValueStoreQuerySingle<User>('users', kvsEqual('email', email));
  return user; // User | null
}
```

## Signature

```typescript
function* askKeyValueStoreQuerySingle<T>(
  keyValueStoreName: string,
  keyCondition: KvsQueryOperation,
  filter?: KvsQueryOperation,
  sortAscending?: boolean,
  limit?: number,
): AskResponse<T | null>;
```

## Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `keyValueStoreName` | `string` | – | Name of the store to query — must match a store declared with [defineKeyValueStore](../../../config/core/key-value-store.md). |
| `keyCondition` | `KvsQueryOperation` | – | The key condition — see [Query conditions](./ask-key-value-store-query.md#query-conditions-kvsqueryoperation). |
| `filter` | `KvsQueryOperation` | – | Optional filter on non-key attributes, applied after the key match. |
| `sortAscending` | `boolean` | – | Order by the sort key; `false` returns the highest/newest first. |
| `limit` | `number` | `1` | How many records to fetch per underlying page while searching. The story still returns only the first matching record. |

## Returns

`T | null` — the first matching record, or `null` if nothing matches.

## Notes

- Because `filter` is applied after the key match, when a filter is supplied the helper pages through results until it has gathered up to `limit` records before returning the first — so a matching record isn't missed just because it fell outside the first page.
- Errors surface the same as the underlying query (`KeyValueStoreQueryErrorTypeEnum`); catch them with `askCatch`.

## Related

- [askKeyValueStoreQuery](./ask-key-value-store-query.md) — the single-page action this wraps.
- [askKeyValueStoreQueryAll](./ask-key-value-store-query-all.md) — collect every match instead of the first.
- [askKeyValueStoreGet](./ask-key-value-store-get.md) — fetch by partition key when you already know it.
- [defineKeyValueStore](../../../config/core/key-value-store.md) — declares the store.
