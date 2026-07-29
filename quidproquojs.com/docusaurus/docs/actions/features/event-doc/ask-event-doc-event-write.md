---
title: askEventDocEventWrite
description: Low-level conditional write of a single event to a document's events store, keyed by its sortable event id.
---

# askEventDocEventWrite

The low-level write primitive behind the event log. It persists one already-built [EventDocEvent](./ask-event-doc-event-append.md#eventdocevent) into the collection's events store, keyed by `pk = modelId` / `sk = eventId` (a sortable id — UUIDv7 — whose string form sorts lexicographically in creation order). The write is **conditional** (`ifNotExists`), but since ids are minted uniquely (via `askNewSortableGuid`) rather than allocated, this is a cheap uniqueness assertion rather than a contested slot: a `Conflict` here means two writers minted the same id, which should never happen and indicates a bug, not ordinary concurrent-write contention.

Id assignment, dedup, and validation all live one layer up in [askEventDocEventAppend](./ask-event-doc-event-append.md) (dedup and validation are actually decided later still, at fold time) — you almost always want that instead. Call this directly only when you are implementing your own append semantics.

- **Built from:** [askKeyValueStoreUpsertWithRetry](../../core/key-value-store/ask-key-value-store-upsert-with-retry.md) with `{ ifNotExists: true }`, plus [askEventDocResolveStore](./ask-event-doc-provide-store.md#askeventdocresolvestore) to find the events store name. Not a single action.
- **Requires the store context** — provide it via [askEventDocProvideStore](./ask-event-doc-provide-store.md) / [askEventDocProvideStoreFromGlobals](./ask-event-doc-provide-store.md#askeventdocprovidestorefromglobals).

```typescript
import { askEventDocEventWrite } from 'quidproquo-features';

export function* persistPrebuiltEvent(docId: string, event: EventDocEvent) {
  yield* askEventDocEventWrite(docId, event);
}
```

## Signature

```typescript
function* askEventDocEventWrite(modelId: string, event: EventDocEvent): AskResponse<void>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `modelId` | `string` | The document id — becomes the partition key (`pk`) of the stored event. |
| `event` | `EventDocEvent` | A fully-formed event, including `payload.metadata.eventId` — the sortable id becomes the sort key (`sk`) and the slot that is claimed conditionally. |

## Returns

`AskResponse<void>` — the story resumes once the event is written.

## Notes

- The stored shape is `{ pk: modelId, sk: eventId, data: event }`; the `EventDocStoredEvent` mapping is the only place that knows the key layout, keeping the domain event free of storage concerns.
- Because the write is conditional, an id collision surfaces `KeyValueStoreUpsertErrorTypeEnum.Conflict`. [askEventDocEventAppend](./ask-event-doc-event-append.md) does not catch or retry on it — with sortable ids minted uniquely per append, this is not an expected contention path.

## Related

- [askEventDocEventAppend](./ask-event-doc-event-append.md) — the high-level append that mints the sortable id and writes through this.
- [askEventDocEventList / EventListAll / EventLast](./ask-event-doc-event-list.md) — reading events back.
- [askKeyValueStoreUpsertWithRetry](../../core/key-value-store/ask-key-value-store-upsert-with-retry.md) — the underlying conditional upsert.
- [askEventDocProvideStore](./ask-event-doc-provide-store.md) — provides the required store context.
