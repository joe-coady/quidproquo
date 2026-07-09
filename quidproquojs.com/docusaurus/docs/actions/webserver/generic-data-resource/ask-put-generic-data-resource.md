---
title: askPutGenericDataResource
description: Write a single item into a named data-resource table.
---

# askPutGenericDataResource

Writes a single item into a **generic data resource** — a named table addressed directly by name. A "generic data resource" is a low-level, schema-agnostic data operation: rather than reading and writing through a typed [key-value store](../../../config/core/key-value-store.md), you pass a raw `tableName` and a raw `item` object. It is a generic building block used by tooling (for example the admin log viewer) that needs to read and write arbitrary tables without a compile-time model of them.

- **Action type:** `GenericDataResourceActionTypeEnum.Put`

```typescript
import { askPutGenericDataResource } from 'quidproquo-webserver';

export function* saveRecord(tableName: string) {
  const stored = yield* askPutGenericDataResource(tableName, {
    id: '123',
    name: 'Example',
  });

  return stored;
}
```

## Signature

```typescript
function* askPutGenericDataResource(
  tableName: string,
  item: object,
): AskResponse<object>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `tableName` | `string` | The name of the target data-resource table to write into. |
| `item` | `object` | The item to store. An arbitrary object — there is no compile-time schema. |

## Returns

`object` — the stored item.

## Related

- [askScanGenericDataResource](./ask-scan-generic-data-resource.md) — read items back out of a data-resource table.
- [defineKeyValueStore](../../../config/core/key-value-store.md) — the typed, first-class alternative for modelling application data.
