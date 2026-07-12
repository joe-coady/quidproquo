---
title: defineTenant
description: Wire up org/tenant support for a service (the tenant stores, publish sync, scope resolver, and tenant routes) in one call.
---

# defineTenant

Wires up **everything a service needs for org/tenant support** in a single call. It returns a `QPQConfig` (an array of config settings) composed of:

- The tenant stores ([defineTenantStores](./tenant-stores.md)): the tenant event-doc collection plus the materialized record table and the membership links table.
- The publish-to-record-store sync: an [inline function](../core/inline-function.md) (`askTenantOnPublish`) that runs on every published tenant document, re-folds the full event log, and upserts the resulting `TenantRecord`. It is a plain upsert of the fold result, so publish retries and repair re-runs are safe.
- The scope resolver ([defineTenantScopeResolver](./tenant-scope-resolver.md), with no owner): the inline functions this service uses to tenant-scope its **other** collections. The tenant collection itself stays unscoped; it is the registry.
- The generic event-doc CRUD under `{basePath}/docs` ([defineEventDocRoutes](./event-doc-routes.md) for the `tenants` store, `tenant` type, with the publish sync wired in as `onPublish`).
- The tenant-specific routes at `{basePath}`: list my tenants, create, and get record.

- **On AWS:** deploys everything [defineTenantStores](./tenant-stores.md) deploys (three DynamoDB tables and an S3 bucket) plus the API Gateway routes and Lambda handlers from [defineEventDocRoutes](./event-doc-routes.md) and the three tenant routes below. The inline functions deploy no infrastructure of their own.

```typescript
import { defineTenant } from 'quidproquo-features';

export default [
  ...defineTenant({
    basePath: '/tenants',
    routeAuthSettings: { userDirectoryName: 'users' },
  }),
];
```

## Routes mounted

All paths are prefixed with the version segment `/v{version}` (default `/v1`) and use the `routeAuthSettings` you pass:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `{basePath}` | The authenticated user's tenants, as `EventDocSummary` rows (drafts included). |
| `POST` | `{basePath}` | Create a tenant (body `{ name }`); the caller becomes its first member. |
| `GET` | `{basePath}/{id}` | One tenant's materialized record (the fast path). Members only: non-members get `Forbidden`, a missing record gets `NotFound`. |

On top of these, the full generic event-doc route set (create, append, list, assets, and so on) is mounted under `{basePath}/docs`; see [defineEventDocRoutes](./event-doc-routes.md#routes-mounted) for the list.

## Signature

```typescript
function defineTenant(options: TenantRoutesOptions): QPQConfig;
```

## Parameters

The single `options` argument is a `TenantRoutesOptions`:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `basePath` | `` `/${string}` `` | – (required) | URL prefix the tenant routes mount under, e.g. `/tenants`. The generic event-doc CRUD mounts under `{basePath}/docs`. |
| `routeAuthSettings` | `RouteAuthSettings` | – (required) | Auth applied to every mounted route (see [route](../webserver/route.md)). Required here, unlike the generic event-doc routes: tenant routes are meaningless unauthenticated, since membership keys off the user. |
| `version` | `number` | `1` | Version number for the `/v{version}` path prefix on every route. |
| `tenantHeaderName` | `string` | `'x-qpq-tenant-id'` | The header the client sends its selected tenant id on. Exposed to the tenant routes as the `tenantHeaderName` global, which the [scope resolver](./tenant-scope-resolver.md) reads. |

## Notes

- Tenant state is event-sourced: the `tenants` event-doc collection is the audit-trailed source of truth, and the `tenantRecords` table is a read model synced on publish. Request handlers never write the record table directly.
- The `TenantRecord` produced by the publish sync carries `tenantId`, `name`, `brandColors`, `logoUrl`, `createdAt`, `updatedAt`, `createdByUserId`, and a `status` derived from the summary (`deleted` when the summary has a `deletedAt`, otherwise `active`).
- `defineTenant` registers the scope resolver but does not apply it to anything. To tenant-scope one of your own collections, pass `TENANT_SCOPE_RESOLVER_FN` as that collection's `scopeResolver` option; see [defineTenantScopeResolver](./tenant-scope-resolver.md).
- Other services that need to validate tenant membership (without owning these stores) call [defineTenantScopeResolver](./tenant-scope-resolver.md) with a `linksOwner` pointing at the service that ran `defineTenant`.

## Related

- [defineTenantStores](./tenant-stores.md): the store half of this helper.
- [defineTenantScopeResolver](./tenant-scope-resolver.md): the scope-resolver half; call it directly (with `linksOwner`) in non-owning services.
- [defineEventDocRoutes](./event-doc-routes.md): the generic CRUD mounted under `{basePath}/docs`, and home of the `scopeResolver` / `onPublish` options.
- [defineWebSocketQueue](../webserver/web-socket-queue.md): where the tenant connection-scope validator plugs in.
