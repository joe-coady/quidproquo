---
title: askEventDocSoftDelete
description: Soft-delete an event document by stamping deletedAt, keeping its versions and assets intact.
---

# askEventDocSoftDelete

Soft-deletes an event document by stamping `deletedAt` (and refreshing `updatedAt`/`updatedBy`) on its summary record. The document's versions and blob claims stay intact — nothing is destroyed — and [askEventDocList](./ask-event-doc-list.md) hides it by default. This is the **public** deletion path. Returns the updated [`EventDocSummary`](./ask-event-doc-get-by-id.md#the-summary-record).

- **Built from:** [askEventDocGetByIdOrThrow](./ask-event-doc-get-by-id.md#askeventdocgetbyidorthrow) (loads the record, throwing `NotFound` if missing), then a validated [askEventDocUpsert](./ask-event-doc-create.md#askeventdocupsert). Requires the store context — call it inside `askEventDocProvideStore({ storeName, type }, ...)`.

```typescript
import { askEventDocSoftDelete } from 'quidproquo-features';

export function* archiveArticle(id: string, userId: string) {
  const summary = yield* askEventDocSoftDelete(id, userId);
  return summary; // deletedAt is now set
}
```

## Signature

```typescript
function* askEventDocSoftDelete(
  id: string,
  updatedBy: string,
): AskResponse<EventDocSummary>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document to soft-delete. |
| `updatedBy` | `string` | User id to record as having performed the deletion (written to `updatedBy`). |

## Returns

`EventDocSummary` — the updated record with `deletedAt` set to the deletion time.

## Notes

- Throws `ErrorTypeEnum.NotFound` (from quidproquo-core) when no document exists for `id`.
- Soft-deleted rows are still returned by [askEventDocGetById](./ask-event-doc-get-by-id.md) (filtering is the caller's concern) and by [askEventDocList](./ask-event-doc-list.md) only when `includeDeleted: true`.

---

## askEventDocDelete

**Hard delete** — permanently removes the document's summary row from the store. This is for internal cleanup/admin only; the public lifecycle uses soft delete (above). It does not touch the event log or the asset bucket, so a hard delete of the summary alone leaves orphaned events/assets — use deliberately.

```typescript
function* askEventDocDelete(id: string): AskResponse<void>;
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document whose summary row to delete. |

**Returns** `void`.

Requires the store context. Prefer `askEventDocSoftDelete` for anything user-facing.

## Related

- [askEventDocGetByIdOrThrow](./ask-event-doc-get-by-id.md#askeventdocgetbyidorthrow) — the load-or-throw this composes.
- [askEventDocList](./ask-event-doc-list.md) — hides soft-deleted documents by default.
- [askEventDocCreate](./ask-event-doc-create.md) — the create counterpart.
- [askDateNow](../../core/date/ask-date-now.md) — supplies the `deletedAt` timestamp.
