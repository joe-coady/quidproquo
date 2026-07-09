---
title: defineEventDocSummary
description: Declare the stores for an event-sourced document collection — its summary table, append-only event log, and asset bucket.
---

# defineEventDocSummary

Declares the **stores** that back an event-document collection, without any routes. It returns a `QPQConfig` (an array of config settings) that expands to three underlying core stores:

1. A **summary key-value store** (partition key `type`, sort key `id`) — the queryable record for each document, derived by folding the identity/lifecycle events of its log. Rows are the [`EventDocSummary`](../../actions/features/event-doc/ask-event-doc-get-by-id.md) shape and carry the version history. A secondary index on `(type, updatedAt)` supports the recently-updated ordering [askEventDocList](../../actions/features/event-doc/ask-event-doc-list.md) returns.
2. An **append-only events store** (`<storeName>Events`, partition key `pk`, numeric sort key `sk`) — the ordered log every document is folded from. It has **no** secondary index on purpose: the local dev-server query processor can't target one, so all event reads go through the main table.
3. A **storage drive** (`<storeName>edocs`, lower-cased) — the collection's blob bucket, holding each document's immutable uploaded assets (and later its derived runtime artifacts) under per-document prefixes.

Point-in-time recovery is enabled on both tables.

- **On AWS:** deploys two DynamoDB tables (via [defineKeyValueStore](../core/key-value-store.md)) and one S3 bucket (via [defineStorageDrive](../core/storage-drive.md)). All physical names are derived from `keyValueStoreName`, so a collection needs only that one name.

```typescript
import { defineEventDocSummary } from 'quidproquo-features';

export default [
  ...defineEventDocSummary('content'),
];
```

Use `defineEventDocSummary` when you want to define the store separately from the routes — most importantly, when **several document types share one store**. Call it once, then call [defineEventDocRoutes](./event-doc-routes.md) per type. For the common single-type case, [defineEventDoc](./event-doc.md) does both in one call.

## Signature

```typescript
function defineEventDocSummary(keyValueStoreName: string): QPQConfig;
```

## Parameters

### `keyValueStoreName` — `string` (required)

The collection's base store name. It is used directly as the summary store name and as the `storeName` that route definitions and store-context calls reference. The events table name (`` `${name}Events` ``) and asset bucket name (`` `${name}edocs`.toLowerCase() ``) are both derived from it, so the whole collection is addressed by this single name. It must match the `storeName` passed to any [defineEventDocRoutes](./event-doc-routes.md) (or [askEventDocProvideStore](#related)) for the same collection.

## Examples

```typescript
import { defineEventDocSummary } from 'quidproquo-features';
import { defineEventDocRoutes } from 'quidproquo-features';

// One shared store, two document types served on different paths.
export default [
  ...defineEventDocSummary('content'),
  ...defineEventDocRoutes({ storeName: 'content', type: 'article', basePath: '/articles' }),
  ...defineEventDocRoutes({ storeName: 'content', type: 'page', basePath: '/pages' }),
];
```

## Related

- [defineEventDocRoutes](./event-doc-routes.md) — mounts the HTTP routes against a store declared here (one per type).
- [defineEventDoc](./event-doc.md) — declares this store *and* its routes together for the single-type case.
- [defineKeyValueStore](../core/key-value-store.md) / [defineStorageDrive](../core/storage-drive.md) — the core config settings this helper composes.
- **Reading the store from a custom story:** wrap data calls in `askEventDocProvideStore({ storeName, type }, ...)` (from quidproquo-features) so getters like [askEventDocGetById](../../actions/features/event-doc/ask-event-doc-get-by-id.md) resolve the right collection.
