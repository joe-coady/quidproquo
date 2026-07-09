---
title: askEventDocEventList
description: Read a document's event log — a page of events, the whole log flattened, or just the latest event.
---

# Reading the event log

Three read helpers over a document's event stream. All three resolve the collection's events store from the store context and query it by `pk = modelId`, ascending by log index (except `askEventDocEventLast`, which reads the tail). They are the read side of the event-sourcing core, feeding the fold that reconstructs a document from its events.

- **Requires the store context** — provide it via [askEventDocProvideStore](./ask-event-doc-provide-store.md) / [askEventDocProvideStoreFromGlobals](./ask-event-doc-provide-store.md#askeventdocprovidestorefromglobals).
- **Built from:** [askKeyValueStoreQuery](../../core/key-value-store/ask-key-value-store-query.md) against the events store, plus [askEventDocResolveStore](./ask-event-doc-provide-store.md#askeventdocresolvestore). Not single actions.

## askEventDocEventList

Returns one page of events for a document, oldest first. Supports paging and, via `afterIndex`, fetching only the tail since a known index — an incremental refresh.

```typescript
import { askEventDocEventList } from 'quidproquo-features';

export function* refreshSince(docId: string, lastSeenIndex: number) {
  const page = yield* askEventDocEventList(docId, { afterIndex: lastSeenIndex });
  return page.items; // events with index > lastSeenIndex
}
```

### Signature

```typescript
function* askEventDocEventList(
  modelId: string,
  options?: EventDocEventListOptions,
): AskResponse<QpqPagedData<EventDocEvent>>;
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `modelId` | `string` | The document id to read events for. |
| `options` | `EventDocEventListOptions` | Optional paging / range options — see below. |

#### `EventDocEventListOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `limit` | `number` | (store default) | Max number of events to return in the page. |
| `nextPageKey` | `string` | — | Continuation token from a previous page's `nextPageKey`. |
| `afterIndex` | `number` | — | Return only events whose log index is greater than this (exclusive). A sort-key range condition on the events store's primary key — no GSI involved. |

### Returns

`AskResponse<QpqPagedData<EventDocEvent>>` — `{ items: EventDocEvent[]; nextPageKey?: string }`. Events are ordered ascending by index; `nextPageKey` is present when more events remain.

## askEventDocEventListAll

Pages through the **whole** log (ascending) and returns it as a flat array — the complete history a from-scratch fold needs. The append-time validator uses this; until state snapshots exist it re-reads the full log per validated append, so treat it as O(log length).

```typescript
import { askEventDocEventListAll } from 'quidproquo-features';

export function* fullHistory(docId: string) {
  return yield* askEventDocEventListAll(docId); // EventDocEvent[]
}
```

### Signature

```typescript
function* askEventDocEventListAll(modelId: string): AskResponse<EventDocEvent[]>;
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `modelId` | `string` | The document id to read the full log for. |

### Returns

`AskResponse<EventDocEvent[]>` — every event for the document, ordered ascending by index. Internally loops [askEventDocEventList](#askeventdoceventlist) until there is no `nextPageKey`.

## askEventDocEventLast

Returns the newest event in the log, or `null` if the document has no events. Used to assign the next index, dedup, and validate during an append. Relies on numeric sort-key ordering (the dev server sorts numeric sort keys numerically, matching DynamoDB), so it returns the true latest.

```typescript
import { askEventDocEventLast } from 'quidproquo-features';

export function* currentVersion(docId: string) {
  const last = yield* askEventDocEventLast(docId);
  return last ? last.payload.metadata.version : 0;
}
```

### Signature

```typescript
function* askEventDocEventLast(modelId: string): AskResponse<Nullable<EventDocEvent>>;
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `modelId` | `string` | The document id to read the tail of. |

### Returns

`AskResponse<Nullable<EventDocEvent>>` — the latest [EventDocEvent](./ask-event-doc-event-append.md#eventdocevent), or `null` when the log is empty.

## Related

- [askEventDocEventAppend](./ask-event-doc-event-append.md) — the write side; uses `EventLast` and `EventListAll` internally.
- [askEventDocEventWrite](./ask-event-doc-event-write.md) — the low-level conditional write.
- [askEventDocProvideStore](./ask-event-doc-provide-store.md) — provides the store context these require.
- [askKeyValueStoreQuery](../../core/key-value-store/ask-key-value-store-query.md) — the underlying query action.
