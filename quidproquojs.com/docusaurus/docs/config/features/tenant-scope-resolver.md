---
title: defineTenantScopeResolver
description: Register the tenant scope-resolver and connection-scope-validator inline functions so a service can tenant-scope its storage and WebSocket connections.
---

# defineTenantScopeResolver

Registers everything a service needs to **tenant-scope its storage**: the scope-resolver inline function (wired into an event-doc collection's `scopeResolver` option) and the connection-scope validator (wired into a WebSocket queue's `connectionScopeValidator` option). For services that do **not** own the tenant stores, it can also re-declare the membership table as a cross-module reference so membership checks run locally. It returns a `QPQConfig` (an array of config settings).

The inline functions it registers, by their exported constant names:

- `TENANT_SCOPE_RESOLVER_FN` (`'askTenantScopeResolver'`): resolves the request's optional tenant header into a validated storage scope. No header means `null` (Personal, unscoped). A present header is membership-checked against the `userTenantLinks` table on **every** request before the id becomes trusted scope; a non-member gets a `Forbidden` error. The header name comes from the `tenantHeaderName` global where set (the tenant feature's own routes set it), falling back to `x-qpq-tenant-id` everywhere else.
- `TENANT_CONNECTION_SCOPE_VALIDATOR_FN` (`'askTenantConnectionScopeValidator'`): invoked with `{ userId, requestedScope }` when a WebSocket client's Authenticate message claims a tenant. It membership-checks the claim and returns a boolean; only a `true` result lets the claim be stored on the connection record.

- **On AWS:** the two inline functions deploy no dedicated infrastructure (see [defineInlineFunction](../core/inline-function.md)); registration just makes them resolvable by name. When `linksOwner` is passed, the `userTenantLinks` [key-value store](../core/key-value-store.md) is declared with that owner, so it resolves as a reference to the owning service's table rather than deploying a new one.

```typescript
import { defineTenantScopeResolver, TENANT_SCOPE_RESOLVER_FN } from 'quidproquo-features';
import { defineEventDocRoutes } from 'quidproquo-features';

export default [
  // This service does not own the tenant stores; 'ca' does.
  ...defineTenantScopeResolver({ module: 'ca' }),

  // Tenant-scope this service's own collection.
  ...defineEventDocRoutes({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'users' },
    scopeResolver: TENANT_SCOPE_RESOLVER_FN,
  }),
];
```

## Signature

```typescript
function defineTenantScopeResolver(linksOwner?: CrossModuleOwner): QPQConfig;
```

## Parameters

### `linksOwner`: `CrossModuleOwner` (optional)

The service that owns the tenant stores, e.g. `{ module: 'ca' }`. When set, the `userTenantLinks` membership table is re-declared with this owner so the current service can run membership checks against the owning service's table. **Omit it in the owning service**: [defineTenant](./tenant.md) already composes `defineTenantScopeResolver()` with no owner there, and the table itself comes from [defineTenantStores](./tenant-stores.md).

## Notes

- Wiring is by name: pass `TENANT_SCOPE_RESOLVER_FN` as the `scopeResolver` option on [defineEventDocRoutes](./event-doc-routes.md) (or defineEventDoc), and `TENANT_CONNECTION_SCOPE_VALIDATOR_FN` as the `connectionScopeValidator` on [defineWebSocketQueue](./web-socket-queue.md).
- The scope resolver is the generic event-doc `scopeResolver` hook, so any collection can be tenant-scoped without the event-doc feature knowing about tenants.
- The header is never trusted alone. Even though the client picks the tenant, every request re-validates membership before the tenant id becomes the ambient storage scope.
- The tenant collection itself (the `tenants` store) stays unscoped; it is the registry. The resolver exists so a service can scope its **other** collections.

## Related

- [defineTenant](./tenant.md): composes this (with no owner) alongside the stores and routes in the owning service.
- [defineTenantStores](./tenant-stores.md): declares the membership table this resolver validates against.
- [defineEventDocRoutes](./event-doc-routes.md): the `scopeResolver` option these functions plug into.
- [defineWebSocketQueue](./web-socket-queue.md): the `connectionScopeValidator` option for the WebSocket side.
- [defineTenantedWebSocketQueue](./tenanted-web-socket-queue.md): wires `TENANT_CONNECTION_SCOPE_VALIDATOR_FN` in for you.
- [defineInlineFunction](../core/inline-function.md): the underlying registration mechanism.
