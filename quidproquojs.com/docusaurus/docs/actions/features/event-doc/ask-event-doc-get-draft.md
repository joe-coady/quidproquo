---
title: askEventDocGetDraft
description: Resolve an event document's version pointers — draft, latest published, and as-of time-travel reads.
---

# askEventDocGetDraft

Resolves the current **draft** version pointer for a document by `id`, or `null` if there is no draft (or the document is missing). Together with the three actions below, this is the set of **version reads** over an event document's `versions` history.

- **Built from:** [askEventDocGetById](./ask-event-doc-get-by-id.md) plus an in-memory version selector. Requires the store context — call it inside `askEventDocProvideStore({ storeName, type }, ...)`, or from a built-in route where the context is already provided.

First, a quick recap of the model (full detail on the [read-by-id page](./ask-event-doc-get-by-id.md#the-event-document-model)): an event document is derived by folding its event log. Each **version** pointer in the summary's `versions` array records the `eventIndex` of its last event (its head) and, once published, its `publishedAt` and `effectiveFrom` times. The tail version with no `publishedAt` is the **draft**; a `PUBLISH` event freezes a version and opens the next draft.

```typescript
import { askEventDocGetDraft } from 'quidproquo-features';

export function* currentDraft(id: string) {
  const draft = yield* askEventDocGetDraft(id);
  return draft; // EventDocVersion | null
}
```

## Signature

```typescript
function* askEventDocGetDraft(id: string): AskResponse<Nullable<EventDocVersion>>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document. |

## Returns

`EventDocVersion | null` — the draft version pointer (the tail version with no `publishedAt`), or `null` when the document has no draft or does not exist.

### `EventDocVersion`

```typescript
type EventDocVersion = {
  version: number;
  eventIndex: number;    // log index of this version's head event
  publishedAt?: string;  // unset while it is the tail draft
  effectiveFrom?: string; // when the publish takes effect (as-of selection)
};
```

To fold or render a version's content, fold the log's events with index ≤ its `eventIndex`.

---

## askEventDocGetLatestPublished

Resolves the **latest published** version pointer for a document (the highest version that has a `publishedAt`), or `null` if nothing is published yet or the document is missing.

```typescript
function* askEventDocGetLatestPublished(id: string): AskResponse<Nullable<EventDocVersion>>;
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document. |

**Returns** `EventDocVersion | null` — the highest version with a `publishedAt`, or `null`.

## askEventDocGetPublishedAsOf

Resolves the version **published at or before** a given clock time — as-of-clock time-travel keyed on `publishedAt`. Pass a version's own `publishedAt` to render it as-was, or `now` for the latest. Returns `null` when nothing was published by that time (or the document is missing).

```typescript
function* askEventDocGetPublishedAsOf(
  id: string,
  clock: QpqIsoDateTime,
): AskResponse<Nullable<EventDocVersion>>;
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document. |
| `clock` | `QpqIsoDateTime` | ISO-8601 timestamp to resolve as-of. |

**Returns** `EventDocVersion | null` — the highest version with `publishedAt <= clock`, or `null`.

## askEventDocPublishedEventsAsOf

Returns the **events** that make up the version published and *effective* at `clock` — the log truncated at that version's head. It resolves the version from the summary via `effectiveFrom` (when the publish takes effect, so a publish scheduled for the future stays invisible until then), then returns every event with `index <= version.eventIndex`. Fold the returned events to get the published, as-of-`clock` content — the generic backbone of a "render published" flow. (This mirrors `askEventDocGetPublishedAsOf`, which returns the version pointer rather than its events, and keys on `publishedAt` rather than `effectiveFrom`.)

```typescript
function* askEventDocPublishedEventsAsOf(
  id: string,
  clock: QpqIsoDateTime,
): AskResponse<Nullable<EventDocEvent[]>>;
```

| Parameter | Type | Description |
| --- | --- | --- |
| `id` | `string` | Id of the document. |
| `clock` | `QpqIsoDateTime` | ISO-8601 timestamp to resolve the effective version as-of. |

**Returns** `EventDocEvent[] | null` — the truncated event log for the effective version, or `null` when the document is missing/deleted or nothing is effective yet. Reads the full log via `askEventDocEventListAll` (quidproquo-features).

## Related

- [askEventDocGetById / askEventDocGetByIdOrThrow](./ask-event-doc-get-by-id.md) — read the full summary record (and the model reference).
- [askEventDocList](./ask-event-doc-list.md) — enumerate a collection's documents.
- **Publishing / appending events:** `askEventDocEventAppend` (quidproquo-features) advances the log that these reads project.
- [defineEventDocSummary](../../../config/features/event-doc-summary.md) — declares the store these read from.
