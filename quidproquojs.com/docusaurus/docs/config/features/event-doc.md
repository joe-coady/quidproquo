---
title: defineEventDoc
description: Define an event-sourced document collection — its stores plus its HTTP routes — in one call.
---

# defineEventDoc

Defines a complete **event-document collection**: the data stores that hold it *and* the HTTP routes that serve it, in a single call. This is the all-in-one helper for the common **one-store-one-type** case. It returns a `QPQConfig` (an array of config settings) that you spread into a service's infrastructure default export.

An event document is not stored as a mutable row. It is derived by folding an ordered, append-only log of events. `defineEventDoc` provisions that log (plus a queryable summary table and a blob bucket) and mounts the REST routes that create documents, append events, read them back, and resolve their draft/published versions.

- **On AWS:** deploys everything [defineEventDocSummary](./event-doc-summary.md) deploys (two DynamoDB tables — a summary table and an append-only events table — plus an S3 bucket for assets) and everything [defineEventDocRoutes](./event-doc-routes.md) deploys (the API Gateway routes and their Lambda handlers). It creates no infrastructure of its own; it is exactly `[defineEventDocSummary(options.storeName), defineEventDocRoutes(options)]`.

```typescript
import { defineEventDoc } from 'quidproquo-features';

export default [
  ...defineEventDoc({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'editors' },
  }),
];
```

## When to use `defineEventDoc` vs `defineEventDocSummary` + `defineEventDocRoutes`

`defineEventDoc` defines the store **and** the routes together, so it assumes exactly one document `type` per store. If you want several document types to share one physical store (one summary table, one events table, one bucket), you must not define the store more than once. In that case, call [defineEventDocSummary](./event-doc-summary.md) **once** for the shared store, then [defineEventDocRoutes](./event-doc-routes.md) **per type** — each with the same `storeName` but a different `type` and `basePath`. Use `defineEventDoc` whenever the store backs a single type.

## Signature

```typescript
function defineEventDoc(options: EventDocRoutesOptions): QPQConfig;
```

## Parameters

`defineEventDoc` takes the same `EventDocRoutesOptions` object as [defineEventDocRoutes](./event-doc-routes.md); `options.storeName` is also passed straight through to [defineEventDocSummary](./event-doc-summary.md). See the [defineEventDocRoutes parameter reference](./event-doc-routes.md#parameters) for every field.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `storeName` | `string` | yes | Name of the summary store to create and serve. Also derives the events table and asset bucket names. |
| `type` | `string` | yes | The document type this collection holds — the store's partition value, so one store can (via the split helpers) hold several types. |
| `basePath` | `` `/${string}` `` | yes | URL prefix the routes mount under, e.g. `/articles`. |
| `routeAuthSettings` | `RouteAuthSettings` | no | Auth for the mounted routes. Omit to leave them open — mutations then have no user to attribute. |
| `version` | `number` | no | Route version prefix (`/v{version}`), default `1`. |
| `eventValidator` | `string` | no | Inline-function name run on every append to reject invalid events. |
| `eventRenderer` | `string` | no | Inline-function name that folds + renders the log to HTML; mounting it adds a `GET {basePath}/{id}/render` route. |
| `onPublish` | `string` | no | Inline-function name invoked with `{ docId, event, summary }` after every successful Publish append: the seam for syncing the folded document into a materialized read model. |
| `scopeResolver` | `string` | no | Inline-function name every route invokes with `{ event }` to resolve the request's ambient storage scope (e.g. per-tenant); null means unscoped. |

## Examples

```typescript
import { defineEventDoc } from 'quidproquo-features';

export default [
  // A single "article" collection with authenticated mutations.
  ...defineEventDoc({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'editors' },
    eventValidator: 'validateArticleEvent',
    eventRenderer: 'renderArticle',
  }),
];
```

## Related

- [defineEventDocSummary](./event-doc-summary.md) — the store half of this helper; call it directly when several types share one store.
- [defineEventDocRoutes](./event-doc-routes.md) — the routes half; call it per type in the split setup.
- [defineKeyValueStore](../core/key-value-store.md) / [defineStorageDrive](../core/storage-drive.md) — the underlying core config the summary helper composes.
- **Reading a document in your own stories:** [askEventDocGetByIdOrThrow](../../actions/features/event-doc/ask-event-doc-get-by-id.md), [askEventDocList](../../actions/features/event-doc/ask-event-doc-list.md), and the [version reads](../../actions/features/event-doc/ask-event-doc-get-draft.md).
- **Creating a document in your own stories:** [askEventDocCreate](../../actions/features/event-doc/ask-event-doc-create.md).
