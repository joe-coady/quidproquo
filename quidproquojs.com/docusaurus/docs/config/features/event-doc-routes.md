---
title: defineEventDocRoutes
description: Mount the built-in HTTP routes for an event-sourced document collection against an already-declared store.
---

# defineEventDocRoutes

Mounts the built-in REST **routes** for one document `type` in an event-document collection. It returns a `QPQConfig` (an array of route settings). The route controllers ship inside `quidproquo-features` and resolve the store, type, user directory, validator, and renderer from per-route globals — so a service needs no controller wiring of its own: declare the store, add these routes, and the collection is fully served.

`defineEventDocRoutes` defines **only** the routes; it assumes the store already exists (declared with [defineEventDocSummary](./event-doc-summary.md)). Use it directly when **several document types share one store** — call `defineEventDocSummary` once, then `defineEventDocRoutes` per type. For the single-type case, [defineEventDoc](./event-doc.md) does both in one call.

- **On AWS:** deploys the routes below to API Gateway, each backed by a Lambda running the corresponding built-in controller. It creates no data infrastructure — that is [defineEventDocSummary](./event-doc-summary.md)'s job.

```typescript
import { defineEventDocSummary, defineEventDocRoutes } from 'quidproquo-features';

export default [
  ...defineEventDocSummary('content'),
  ...defineEventDocRoutes({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'editors' },
  }),
];
```

## Routes mounted

All paths are prefixed with the version segment `/v{version}` (default `/v1`):

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `{basePath}` | List the collection's documents. |
| `GET` | `{basePath}/{id}` | Get one document's summary record. |
| `GET` | `{basePath}/{id}/events` | List a document's event log. |
| `GET` | `{basePath}/{id}/render` | Render the document to HTML. **Only mounted when `eventRenderer` is set.** |
| `POST` | `{basePath}` | Create a document. |
| `POST` | `{basePath}/{id}/events` | Append an event to a document. |
| `POST` | `{basePath}/{id}/assets` | Request an asset upload URL. |
| `GET` | `{basePath}/{id}/assets/{assetId}` | Download an asset. |
| `DELETE` | `{basePath}/{id}` | Remove a document. |

## Signature

```typescript
function defineEventDocRoutes(options: EventDocRoutesOptions): QPQConfig;
```

## Parameters

The single `options` argument is an `EventDocRoutesOptions`:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storeName` | `string` | – (required) | The store to serve. **Must match a [defineEventDocSummary](./event-doc-summary.md)** in the same service. |
| `type` | `string` | – (required) | The document type this route set serves. Pins the collection within a store that can hold several types — use a distinct `type` (and `basePath`) per `defineEventDocRoutes` call over a shared store. |
| `basePath` | `` `/${string}` `` | – (required) | URL prefix the routes mount under. Must start with `/`, e.g. `/articles`. |
| `routeAuthSettings` | `RouteAuthSettings` | – | Auth settings applied to every mounted route (from quidproquo-webserver — see [route](../webserver/route.md)). When it carries a `userDirectoryName`, that directory is exposed to the controllers so mutations can attribute the acting user. **Omit to leave the routes open** — mutations then have no user to attribute. |
| `version` | `number` | `1` | Version number for the `/v{version}` path prefix on every route. |
| `eventValidator` | `string` | – | Name of a registered inline function (see `defineInlineFunction`). When set, every append invokes it with `{ event, events }` to reject lifecycle- or payload-invalid events before they reach the log. The frontend editor runs the same rule for instant feedback. |
| `eventRenderer` | `string` | – | Name of a registered inline function. When set, a `GET {basePath}/{id}/render` route is mounted; it invokes the renderer with the document's full `{ events }` log, which folds + renders to HTML. |
| `onPublish` | `string` | – | Name of a registered inline function. When set, every successful append of a Publish event invokes it with `{ docId, event, summary }`, after the event is durably written and the summary re-derived. This is the seam for syncing a folded document into a materialized read model. Errors propagate to the caller: the event has landed but the side effect did not, so the caller learns the read model may be stale. |
| `onAppend` | `string` | – | Name of a registered inline function. When set, EVERY successful append (domain events and lifecycle events alike) invokes it with `{ docId, event, summary, events }`, after the event is durably written and the summary re-derived. This is the seam for reacting to any mutation (e.g. broadcasting the doc's fresh fold). Runs after `onPublish` when both fire on the same Publish event. Errors propagate to the caller: the event has landed but the side effect did not. |
| `scopeResolver` | `string` | – | Name of a registered inline function. When set, every route invokes it with `{ event }` before running; a non-null result becomes the ambient storage scope for the whole request, transparently partitioning the collection's stores and assets (e.g. per-tenant). Null means unscoped. Omit for collections that never partition. |
| `excludeRoutes` | `EventDocRouteName[]` | `[]` | Route names to leave unmounted (`'list' \| 'get' \| 'listEvents' \| 'render' \| 'create' \| 'appendEvent' \| 'createAsset' \| 'getAsset' \| 'remove'`). For a collection that must own one of these itself instead of using the stock behavior — e.g. a `create` that must also perform some side effect the stock controller doesn't know about. |

### `RouteAuthSettings`

`routeAuthSettings` is the standard quidproquo-webserver route auth object (the same one [defineRoute](../webserver/route.md) accepts). Its `userDirectoryName` names the [user directory](../core/key-value-store.md) callers authenticate against; the controllers read it to resolve the acting user for event attribution.

## Examples

```typescript
import { defineEventDocSummary, defineEventDocRoutes } from 'quidproquo-features';

export default [
  // One store, two types, each on its own path and route version.
  ...defineEventDocSummary('content'),

  ...defineEventDocRoutes({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'editors' },
    eventValidator: 'validateArticleEvent',
    eventRenderer: 'renderArticle',
  }),

  ...defineEventDocRoutes({
    storeName: 'content',
    type: 'page',
    basePath: '/pages',
    routeAuthSettings: { userDirectoryName: 'editors' },
  }),
];
```

## Related

- [defineEventDocSummary](./event-doc-summary.md) — declares the store these routes serve (required before mounting routes).
- [defineEventDoc](./event-doc.md) — declares the store *and* these routes in one call for the single-type case.
- [defineRoute](../webserver/route.md) — the underlying webserver route config (source of `RouteAuthSettings`).
- **Custom routes over the same store:** wrap your controllers in `askEventDocProvideStore({ storeName, type }, ...)` (from quidproquo-features) so the generic [reads](../../actions/features/event-doc/ask-event-doc-get-by-id.md) resolve the collection, then compose actions like [askEventDocCreate](../../actions/features/event-doc/ask-event-doc-create.md).
