---
title: defineEventDocRoutes
description: Mount the built-in HTTP routes for an event-sourced document collection against an already-declared store.
---

# defineEventDocRoutes

Mounts the built-in REST **routes** for one document `type` in an event-document collection. It returns a `QPQConfig` (an array of route settings). The route controllers ship inside `quidproquo-features` and resolve the store, type, and user directory from per-route globals, invoking the collection's registered `EventDocFunctions` object (looked up by convention as `eventDocFunctionsName(storeName, type)`, see [defineEventDoc](./event-doc.md)) for render/references/snapshot behaviour — so a service needs no controller wiring of its own: declare the store, register the functions object, add these routes, and the collection is fully served.

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
| `GET` | `{basePath}` | List one page of the collection's documents (newest first). Accepts `?limit=` and `?nextPageKey=` and returns `QpqPagedData`. |
| `GET` | `{basePath}/{id}` | Get one document's summary record. |
| `GET` | `{basePath}/{id}/events` | List a document's event log. |
| `GET` | `{basePath}/{id}/render` | Render the document to HTML. 404s as "no renderer configured" when the collection's registered functions object has no `render` member. |
| `GET` | `{basePath}/{id}/references` | List the `EventDocLink`s this document depends on. Resolves to `[]` when the collection has no registered functions object. |
| `POST` | `{basePath}` | Create a document. |
| `POST` | `{basePath}/{id}/events` | Append an event to a document. |
| `POST` | `{basePath}/{id}/assets` | Request an asset upload URL. |
| `GET` | `{basePath}/{id}/assets/{assetId}` | Download an asset. |
| `GET` | `{basePath}/{id}/assets` | List a document's stored assets. |
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
| `onPublish` | `string` | – | Name of a registered inline function. When set, every successful append of a Publish event invokes it with `{ docId, event, summary }`, after the event is durably written and the summary re-derived. This is the seam for syncing a folded document into a materialized read model. Errors propagate to the caller: the event has landed but the side effect did not, so the caller learns the read model may be stale. |
| `onAppend` | `string` | – | Name of a registered inline function. When set, EVERY successful append (domain events and lifecycle events alike) invokes it with `{ docId, event, summary, events }`, after the event is durably written and the summary re-derived. This is the seam for reacting to any mutation (e.g. broadcasting the doc's fresh fold). Runs after `onPublish` when both fire on the same Publish event. Errors propagate to the caller: the event has landed but the side effect did not. |
| `scopeResolver` | `string` | – | Name of a registered inline function. When set, every route invokes it with `{ event }` before running; a non-null result becomes the ambient storage scope for the whole request, transparently partitioning the collection's stores and assets (e.g. per-tenant). Null means unscoped. Omit for collections that never partition. |
| `excludeRoutes` | `EventDocRouteName[]` | `[]` | Route names to leave unmounted (`'list' \| 'get' \| 'listEvents' \| 'render' \| 'references' \| 'create' \| 'appendEvent' \| 'createAsset' \| 'getAsset' \| 'listAssets' \| 'remove'`). For a collection that must own one of these itself instead of using the stock behavior — e.g. a `create` that must also perform some side effect the stock controller doesn't know about. |

Append-time validation, rendering, references, and snapshotting are no longer per-route options: they come from the collection's registered `EventDocFunctions` object (`collectReferences`, `render`, `foldSnapshotViews`, and the doc type's own fold-gate `validators`), addressed by `eventDocFunctionsName(storeName, type)`. Register it with [defineDynamicFunctions](../core/dynamic-functions.md) directly (a multi-type store calling `defineEventDocRoutes` per type) or let [defineEventDoc](./event-doc.md) do it for the single-type case.

### `RouteAuthSettings`

`routeAuthSettings` is the standard quidproquo-webserver route auth object (the same one [defineRoute](../webserver/route.md) accepts). Its `userDirectoryName` names the [user directory](../core/key-value-store.md) callers authenticate against; the controllers read it to resolve the acting user for event attribution.

## Examples

```typescript
import { defineDynamicFunctions } from 'quidproquo-core';
import { defineEventDocSummary, defineEventDocRoutes, eventDocFunctionsName } from 'quidproquo-features';

export default [
  // One store, two types, each on its own path and route version.
  ...defineEventDocSummary('content', { snapshotFunctions: { article: eventDocFunctionsName('content', 'article') } }),

  defineDynamicFunctions(eventDocFunctionsName('content', 'article'), '/entry/eventDocs::articleDefinition'),

  ...defineEventDocRoutes({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'editors' },
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
- [defineEventDoc](./event-doc.md) — declares the store, registers the functions object, *and* mounts these routes in one call for the single-type case.
- [defineDynamicFunctions](../core/dynamic-functions.md) — registers the `EventDocFunctions` object these routes invoke for render/references/snapshot behaviour.
- [defineEventDocTransfer](./event-doc-transfer.md) — mounts the export/import routes that read every registered collection's functions object (`collectReferences`) to build a transfer manifest.
- [defineRoute](../webserver/route.md) — the underlying webserver route config (source of `RouteAuthSettings`).
- **Custom routes over the same store:** wrap your controllers in `askEventDocProvideStore({ storeName, type }, ...)` (from quidproquo-features) so the generic [reads](../../actions/features/event-doc/ask-event-doc-get-by-id.md) resolve the collection, then compose actions like [askEventDocCreate](../../actions/features/event-doc/ask-event-doc-create.md).
