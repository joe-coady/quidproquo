---
title: defineTenantedEventDoc
description: A defineEventDoc with the tenant scope resolver pre-wired, so the collection's stores and assets partition per tenant.
---

# defineTenantedEventDoc

A [defineEventDoc](./event-doc.md) with the tenant scope resolver pre-wired as its `scopeResolver`, so the collection's stores and assets partition per tenant: request header → membership check → tenant scope, or the caller's own personal scope when no header is sent — the collection is never unscoped. It takes the same arguments as `defineEventDoc` minus `scopeResolver`, which it fills in for you.

The deploying service must still register the resolver implementation by calling [defineTenant](./tenant.md) (with the same `owner` used everywhere else). Use plain [defineEventDoc](./event-doc.md) for collections that never partition by tenant.

```typescript
import { defineTenantedEventDoc, defineTenant } from 'quidproquo-features';

export default [
  ...defineTenant({
    owner: { module: 'ca' },
    basePath: '/tenants',
    routeAuthSettings: { userDirectoryName: 'users' },
  }),

  ...defineTenantedEventDoc({
    storeName: 'content',
    type: 'article',
    basePath: '/articles',
    routeAuthSettings: { userDirectoryName: 'users' },
  }),
];
```

## Signature

```typescript
function defineTenantedEventDoc(options: TenantedEventDocOptions): QPQConfig;
```

`TenantedEventDocOptions` is `EventDocRoutesOptions` with `scopeResolver` omitted — see [defineEventDoc](./event-doc.md#parameters) for the remaining options.

## Parameters

Same as [defineEventDoc](./event-doc.md#parameters): `storeName`, `type`, `basePath`, `routeAuthSettings`, `version`, `eventValidator`, `eventRenderer`, `onPublish` (without `scopeResolver`, which this always sets to `TENANT_SCOPE_RESOLVER_FN`).

## Returns

Same as [defineEventDoc](./event-doc.md) — a `QPQConfig` array with the collection's `scopeResolver` already pointed at the tenant scope resolver.

## Related

- [defineEventDoc](./event-doc.md) — the underlying define this pre-configures.
- [defineTenant](./tenant.md) — registers `TENANT_SCOPE_RESOLVER_FN`, the inline function this wires in by name.
- [defineTenantedWebSocketQueue](./tenanted-web-socket-queue.md) — the same pattern applied to a WebSocket queue's `connectionScopeResolver`.
