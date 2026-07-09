---
title: askKeyValueStoreUpsert
description: Write (insert or replace) a whole record into a key-value store.
---

# askKeyValueStoreUpsert

Writes a complete record into a [key-value store](../../../config/core/key-value-store.md). If a record with the same key already exists it is replaced; otherwise a new one is created. To patch individual attributes without replacing the whole item, use [askKeyValueStoreUpdate](./ask-key-value-store-update.md) instead.

- **Action type:** `KeyValueStoreActionType.Upsert`

```typescript
import { askKeyValueStoreUpsert } from 'quidproquo-core';

interface User {
  userId: string;
  name: string;
  email: string;
}

export function* askSaveUser(user: User) {
  yield* askKeyValueStoreUpsert('users', user);
}
```

## Signature

```typescript
function* askKeyValueStoreUpsert<KvsItem>(
  keyValueStoreName: string,
  item: KvsItem,
  options?: KeyValueStoreUpsertOptions,
): AskResponse<void>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `keyValueStoreName` | `string` | Name of the store to write to — must match a store declared with [defineKeyValueStore](../../../config/core/key-value-store.md) (or one shared via its `owner` option). |
| `item` | `KvsItem` | The full record to write. It must include the store's partition key (and sort key, if any) as attributes. |
| `options` | `KeyValueStoreUpsertOptions` | Optional write options — see below. |

### `KeyValueStoreUpsertOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `ttlInSeconds` | `number` | – | Time-to-live in seconds; sets the record's expiry (used with the store's `ttlAttribute`). |
| `ifNotExists` | `boolean` | `false` | Conditional insert: only write when no item with the same key exists. A losing concurrent writer receives `KeyValueStoreUpsertErrorTypeEnum.Conflict` instead of silently overwriting — the primitive for optimistic-concurrency schemes (e.g. append-only event logs where the sort key is a claimed index). |

## Returns

`void` — the story resumes once the write has committed.

## Errors

| Error | Meaning |
| --- | --- |
| `KeyValueStoreUpsertErrorTypeEnum.ServiceUnavailable` | DynamoDB internal error or throttling. |
| `KeyValueStoreUpsertErrorTypeEnum.ResourceNotFound` | The underlying table does not exist. |
| `KeyValueStoreUpsertErrorTypeEnum.Conflict` | A conditional (`ifNotExists`) write lost to an existing item. Namespaced — not the generic `ErrorTypeEnum.Conflict` — so retry logic can target the write race specifically without also catching domain-level conflicts. |

Catch errors with `askCatch` — it returns `{ success: true, result }` or `{ success: false, error }`.

## Related

- [defineKeyValueStore](../../../config/core/key-value-store.md) — declares the store, its keys, and its TTL attribute.
- [askKeyValueStoreUpsertWithRetry](./ask-key-value-store-upsert-with-retry.md) — the same write, retried automatically on transient failures.
- [askKeyValueStoreUpdate](./ask-key-value-store-update.md) — patch attributes instead of replacing the item.
- [askKeyValueStoreGet](./ask-key-value-store-get.md) — read the record back.
- [askKeyValueStoreDelete](./ask-key-value-store-delete.md) — remove the record.
