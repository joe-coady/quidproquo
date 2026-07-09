---
title: askEventDocList
description: List every event document in the current collection, newest-updated first, hiding soft-deleted rows by default.
---

# askEventDocList

Lists the summary records of every document in the current collection (all rows sharing the collection's `type`), sorted by `updatedAt` **descending** (most recently updated first). Soft-deleted documents are hidden unless you opt in.

- **Built from:** a key-value store query over the collection's `type`, filtered and sorted in memory. Requires the store context — call it inside `askEventDocProvideStore({ storeName, type }, ...)`, or from a built-in route where the context is already provided.

```typescript
import { askEventDocList } from 'quidproquo-features';

export function* listArticles() {
  const items = yield* askEventDocList(); // newest-updated first, deleted hidden
  return items;
}
```

## Signature

```typescript
function* askEventDocList<T extends EventDocSummary = EventDocSummary>(
  options?: EventDocListOptions,
): AskResponse<T[]>;
```

## Parameters

### `options` — `EventDocListOptions` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `includeDeleted` | `boolean` | `false` | When `true`, soft-deleted documents (those with a `deletedAt`) are included in the result. When `false` (default), they are filtered out. |

The generic `T` lets callers narrow to a collection-specific extension of [`EventDocSummary`](./ask-event-doc-get-by-id.md#the-summary-record); it defaults to `EventDocSummary`.

## Returns

`EventDocSummary[]` — the collection's records, sorted by `updatedAt` descending. Empty array when the collection has no (visible) documents.

## Notes

- Ordering is applied in memory, but the summary store carries a `(type, updatedAt)` index so this stays efficient.
- Because there is no secondary index on `code`, the code-based reads ([askEventDocGetByCode](./ask-event-doc-get-by-code.md) and friends) list the collection via this action and filter in memory.

## Related

- [askEventDocGetById / askEventDocGetByIdOrThrow](./ask-event-doc-get-by-id.md) — read a single document.
- [askEventDocGetByCode](./ask-event-doc-get-by-code.md) — find one document by its business `code`.
- [askEventDocSoftDelete](./ask-event-doc-soft-delete.md) — sets the `deletedAt` this action filters on.
- [defineEventDocSummary](../../../config/features/event-doc-summary.md) — declares the store (and its ordering index) this reads from.
