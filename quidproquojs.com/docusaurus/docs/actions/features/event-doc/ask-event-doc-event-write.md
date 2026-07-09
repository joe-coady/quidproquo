---
title: askEventDocEventWrite
description: Low-level conditional write of a single event to a document's events store, claiming its (modelId, index) slot atomically.
---

# askEventDocEventWrite

The low-level write primitive behind the event log. It persists one already-built [EventDocEvent](./ask-event-doc-event-append.md#eventdocevent) into the collection's events store, keyed by `pk = modelId` / `sk = index`. The write is **conditional** (`ifNotExists`): the `(modelId, index)` slot is claimed atomically, so a concurrent writer that computed the same index gets a conflict instead of silently overwriting the event.

Ordering, index assignment, dedup, validation, and the conflict-retry loop all live one layer up in [askEventDocEventAppend](./ask-event-doc-event-append.md) — you almost always want that instead. Call this directly only when you are implementing your own append semantics.

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
| `event` | `EventDocEvent` | A fully-formed event, including `payload.metadata.index` — the index becomes the sort key (`sk`) and the slot that is claimed conditionally. |

## Returns

`AskResponse<void>` — the story resumes once the event is written.

## Notes

- The stored shape is `{ pk: modelId, sk: index, data: event }`; the `EventDocStoredEvent` mapping is the only place that knows the key layout, keeping the domain event free of storage concerns.
- Because the write is conditional, a losing concurrent writer surfaces `KeyValueStoreUpsertErrorTypeEnum.Conflict`. [askEventDocEventAppend](./ask-event-doc-event-append.md) is the layer that catches and re-laps on exactly that error.

## Related

- [askEventDocEventAppend](./ask-event-doc-event-append.md) — the high-level append that computes the index, validates, and retries around this write.
- [askEventDocEventList / EventListAll / EventLast](./ask-event-doc-event-list.md) — reading events back.
- [askKeyValueStoreUpsertWithRetry](../../core/key-value-store/ask-key-value-store-upsert-with-retry.md) — the underlying conditional upsert.
- [askEventDocProvideStore](./ask-event-doc-provide-store.md) — provides the required store context.
