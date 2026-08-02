---
title: askEventDocEventAppend
description: Append a client-authored event to a document's log — a single unconditional write with no read, no retry, and no validation.
---

# askEventDocEventAppend

Appends a single client-authored event to a document's ordered event stream — the write half of the event-sourcing core. The event's id is a sortable id (UUIDv7, minted by [askNewSortableGuid](../../core/guid/ask-new-sortable-guid.md)), so the write needs no allocator and no coordination: it does not read the tail, does not validate, and has no retry loop. Concurrent appends to the same document neither contend nor fail on each other. After the event is written it also re-derives the queryable summary record so the document's status, version, name, and timestamps stay in sync with the log.

**Validation happens later, at fold time, not here.** Dedup (a repeated `clientMessageId`), version monotonicity, and lifecycle/domain rules are all decided when the log is folded, against the accepted events before the one in question. An event that fails one of those checks is not rejected at append — it is written, then silently skipped by every fold, so the document reads as though it was never sent. That silence is deliberate: clients are expected to validate before they send (the same rules run client-side against the pending buffer), so a skipped event means a client skipped its own pre-flight, not that the append needs to report an error.

- **Built from:** `askDateNow`, `askNewSortableGuid`, `askEventDocEventWrite`, and `askEventDocSummaryRederive` (plus, when the collection configures `onPublish`/`onAppend`, `askEventDocGetByIdOrThrow`, `askEventDocEventListAll`, and `askInlineFunctionExecute`). Not a single action.
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

  return event.payload.metadata.eventId;
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
| `modelId` | `string` | The document id whose log the event is appended to. Not checked against an existing `INIT_STATE` at append time — an event appended before `INIT_STATE` exists is simply written and then skipped by every fold, since the reducer has no document to fold it onto. |
| `input` | `EventDocEventInput` | The client-authored event envelope — see below. |
| `actor` | `EventDocEventActor` | Who authored the event; stamped onto the event as `createdBy`. Usually obtained from [askEventDocResolveActor](./ask-event-doc-resolve-actor.md). |

### `EventDocEventInput`

What the client POSTs to append an event. `modelId` and the server-stamped provenance (`eventId`, `createdAt`, `createdBy`) are NOT part of it.

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The effect/event type discriminant (e.g. `SET_NAME`). The reducer folds it by this. |
| `payload.data` | `T` | The typed domain data for the event. |
| `payload.metadata.version` | `number` | The schema version the client authored against. Expected `>=` the log's highest accepted version so far — the fold, not the append, silently skips an older one when it later folds the log. |
| `payload.metadata.clientMessageId` | `string` | A client-generated id used for dedup: the fold ignores a later event carrying a `clientMessageId` it has already accepted. The append itself does not check this — a retry is written as a new row in the log either way. |

### `EventDocEventActor`

| Property | Type | Description |
| --- | --- | --- |
| `userId` | `string` | The stable, authoritative user key. |
| `userDisplayName` | `string` | The display name captured at append time (denormalised so history renders without a user lookup). |

## Returns

`AskResponse<EventDocEvent>` — the event now written to the log, with server-stamped metadata (`eventId`, `createdAt`, `createdBy`) filled in. Unlike before, this is not conditional on the event surviving validation — a fold may still skip it.

### `EventDocEvent`

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The event type discriminant. |
| `payload.data` | `T` | The typed domain data. |
| `payload.metadata` | `EventDocEventMetadata` | Full provenance: `version`, `clientMessageId`, `createdBy`, `createdAt`, and `eventId` (a sortable id — mirrors the storage sort key, sorts lexicographically in creation order). |

## Notes

- **No dedup, no version check, and no lifecycle/domain validation at append time.** All three are decided when the log is folded (`foldEventDocLog`), against the accepted events before the one in question: a repeated `clientMessageId` is ignored, an event whose version is older than the log's highest accepted version is ignored, and the collection's `validators` registry (or `defaultEventDocEventValidator` when none is configured) is run there too. A rejected event is skipped silently — the document reads as though it was never written — rather than causing the append to throw.
- **No read, no retry, no coordination.** The append does not read the tail or the log; it mints a sortable id and writes. Two appends landing in the same millisecond get an arbitrary but stable relative order, which is fine because ordering only has to be stable, not wall-clock-precise.
- **Write uniqueness** is still enforced by [askEventDocEventWrite](./ask-event-doc-event-write.md)'s conditional (`ifNotExists`) write, but since ids are unique by construction this should never fire in practice — a collision surfaces as `KeyValueStoreUpsertErrorTypeEnum.Conflict` and indicates a bug (two writers minting the same id), not ordinary contention, so there is no retry around it.
- After writing, it calls `askEventDocSummaryRederive`, which re-folds the whole log and re-derives the document's summary record so the queryable view (identity, version history, timestamps) stays in sync — this is the one piece of read-model maintenance still on the write path, until a stream projector replaces it.
- Hooks (`onPublish`/`onAppend`, when the collection configures them) run after the event is durably written; a hook failure propagates so the caller knows the side effect — not the append — failed.

## Related

- [askEventDocAppendServerEvent](./ask-event-doc-append-server-event.md) — the server-authored wrapper that builds the input envelope for you.
- [askApplyEventDocEvent](./ask-apply-event-doc-event.md) — a declarative, processor-dispatched alternative when the same verb must also run in a browser editor.
- [askEventDocEventWrite](./ask-event-doc-event-write.md) — the low-level conditional write this composes.
- [askEventDocEventList / EventListAll / EventLast](./ask-event-doc-event-list.md) — reading the log this appends to.
- [askEventDocProvideStore](./ask-event-doc-provide-store.md) — provides the store context this requires.
- [askEventDocResolveActor](./ask-event-doc-resolve-actor.md) — resolves the `actor` argument from the access token.
