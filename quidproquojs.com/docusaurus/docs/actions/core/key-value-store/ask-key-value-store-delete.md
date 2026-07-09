---
title: askKeyValueStoreDelete
description: Delete a single record from a key-value store by its key.
---

# askKeyValueStoreDelete

Removes one record from a [key-value store](../../../config/core/key-value-store.md), addressed by its key. Deleting a record that doesn't exist is a no-op.

- **Action type:** `KeyValueStoreActionType.Delete`

```typescript
import { askKeyValueStoreDelete } from 'quidproquo-core';

export function* askRemoveUser(userId: string) {
  yield* askKeyValueStoreDelete('users', userId);
}
```

## Signature

```typescript
function* askKeyValueStoreDelete(
  keyValueStoreName: string,
  key: KvsCoreDataType,
  sortKey?: KvsCoreDataType,
  options?: KeyValueStoreDeleteOptions,
): AskResponse<void>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `keyValueStoreName` | `string` | Name of the store — must match a store declared with [defineKeyValueStore](../../../config/core/key-value-store.md) (or one shared via its `owner` option). |
| `key` | `KvsCoreDataType` | Partition key value of the record to delete (`string \| number`). |
| `sortKey` | `KvsCoreDataType` | Sort key value, required only if the store declares a sort key (`string \| number`). |
| `options` | `KeyValueStoreDeleteOptions` | Reserved for future delete options; currently empty. |

## Returns

`void` — the story resumes once the delete has committed.

## Errors

| Error | Meaning |
| --- | --- |
| `KeyValueStoreDeleteErrorTypeEnum.ServiceUnavailable` | DynamoDB internal error or throttling. |
| `KeyValueStoreDeleteErrorTypeEnum.ResourceNotFound` | The underlying table does not exist. |

Catch errors with `askCatch` — it returns `{ success: true, result }` or `{ success: false, error }`.

## Related

- [defineKeyValueStore](../../../config/core/key-value-store.md) — declares the store and its keys.
- [askKeyValueStoreGet](./ask-key-value-store-get.md) — read the record before deleting.
- [askKeyValueStoreUpsert](./ask-key-value-store-upsert.md) — write the record.
