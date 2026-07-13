---
title: askEventDocEventAppend
description: Append a client-authored event to a document's log with dedup, version and lifecycle validation, and optimistic-concurrency retry.
---

# askEventDocEventAppend

Appends a single client-authored event to a document's ordered event stream — the write half of the event-sourcing core. This is where the append-time safety invariants live: idempotent dedup, version monotonicity, lifecycle/payload validation, and optimistic-concurrency retry. After the event is written it also re-derives the queryable summary record so the document's status, version, name, and timestamps stay in sync with the log.

- **Built from:** a story composing `askRetry`, `askEventDocEventLast`, `askEventDocEventListAll`, `askEventDocEventWrite`, `askEventDocGetByIdOrThrow`, and (when the collection configures one) an `askInlineFunctionExecute` validator. Not a single action.
- **Requires the store context** — wrap the call in [askEventDocProvideStore](./ask-event-doc-provide-store.md) (custom routes) or [askEventDocProvideStoreFromGlobals](./ask-event-doc-provide-store.md#askeventdocprovidestorefromglobals) (built-in routes).

```typescript
import { askEventDocEventAppend } from 'quidproquo-features';

export function* appendTitleChange(docId: string) {
  const actor = yield* askEventDocResolveActor();

  const event = yield* askEventDocEventAppend(
    docId,
    {
      type: 'SET_NAME',
      payload: {
        data: { name: 'Q3 Report' },
        metadata: { version: 3, clientMessageId: yield* askNewGuid() },
      },
    },
    actor,
  );

  return event.payload.metadata.index;
}
```

## Signature

```typescript
function* askEventDocEventAppend(
  modelId: string,
  input: EventDocEventInput,
  actor: EventDocEventActor,
): AskResponse<EventDocEvent>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `modelId` | `string` | The document id whose log the event is appended to. The document must already have an `INIT_STATE` event (created via `askEventDocCreate`), or the append throws `NotFound`. |
| `input` | `EventDocEventInput` | The client-authored event envelope — see below. |
| `actor` | `EventDocEventActor` | Who authored the event; stamped onto the event as `createdBy`. Usually obtained from [askEventDocResolveActor](./ask-event-doc-resolve-actor.md). |

### `EventDocEventInput`

What the client POSTs to append an event. `modelId` and the server-stamped provenance (`index`, `createdAt`, `createdBy`) are NOT part of it.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The effect/event type discriminant (e.g. `SET_NAME`). The reducer folds it by this. |
| `payload.data` | `T` | The typed domain data for the event. |
| `payload.metadata.version` | `number` | The schema version the client authored against. Must be `>=` the last event's version — an older version throws `Conflict`. |
| `payload.metadata.clientMessageId` | `string` | A client-generated id used for dedup: if the latest event already carries it, the append is a no-op and returns that event unchanged. |

### `EventDocEventActor`

| Property | Type | Description |
| --- | --- | --- |
| `userId` | `string` | The stable, authoritative user key. |
| `userDisplayName` | `string` | The display name captured at append time (denormalised so history renders without a user lookup). |

## Returns

`AskResponse<EventDocEvent>` — the event that now lives in the log, with server-stamped metadata (`index`, `createdAt`, `createdBy`) filled in. On a deduped retry, the pre-existing event is returned unchanged.

### `EventDocEvent`

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The event type discriminant. |
| `payload.data` | `T` | The typed domain data. |
| `payload.metadata` | `EventDocEventMetadata` | Full provenance: `version`, `clientMessageId`, `createdBy`, `createdAt`, and `index` (mirrors the storage sort key). |

## Notes

- **Dedup** is best-effort against the latest event only (until a GSI exists): a retry that re-sends the same `clientMessageId` returns the existing tail event without writing.
- **Validation** always runs against the log folded from prior events. If the collection configured an `eventValidator` inline function it runs that (a complete validator that already composes the reserved lifecycle guard); otherwise it runs `defaultEventDocEventValidator` — the same guard with no domain rules. Exactly one validator runs. A rejected event throws `Conflict` with the validator's reason.
- **Concurrency:** the underlying write ([askEventDocEventWrite](./ask-event-doc-event-write.md)) claims the `(modelId, index)` slot conditionally. A losing concurrent writer gets a key-value-store upsert conflict — the only error the internal `askRetry` re-laps on — re-reads the tail, and re-runs dedup/validation against fresh state, so concurrent appends serialize onto consecutive indexes. After `MAX_APPEND_ATTEMPTS` (8) lost races it throws `ErrorTypeEnum.Conflict`.
- **Thrown `ErrorTypeEnum` values:** `NotFound` (no `INIT_STATE`), `Conflict` (stale version, failed validation, or exhausted concurrency retries). These are thrown via `askThrowError`, not a per-action error enum.
- After writing, it re-derives and upserts the document's summary record (via `applyEventDocSummaryEvent`) so the queryable view stays consistent with the log.

## Related

- [askEventDocAppendServerEvent](./ask-event-doc-append-server-event.md) — the server-authored wrapper that builds the input envelope for you.
- [askApplyEventDocEvent](./ask-apply-event-doc-event.md) — a declarative, processor-dispatched alternative when the same verb must also run in a browser editor.
- [askEventDocEventWrite](./ask-event-doc-event-write.md) — the low-level conditional write this composes.
- [askEventDocEventList / EventListAll / EventLast](./ask-event-doc-event-list.md) — reading the log this appends to.
- [askEventDocProvideStore](./ask-event-doc-provide-store.md) — provides the store context this requires.
- [askEventDocResolveActor](./ask-event-doc-resolve-actor.md) — resolves the `actor` argument from the access token.
