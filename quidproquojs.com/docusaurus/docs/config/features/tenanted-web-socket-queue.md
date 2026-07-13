---
title: defineTenantedWebSocketQueue
description: A defineWebSocketQueue with the tenant membership check pre-wired as the connection scope validator.
---

# defineTenantedWebSocketQueue

A [defineWebSocketQueue](./web-socket-queue.md) with the tenant membership check pre-wired as its `connectionScopeValidator`, so a tenant id claimed in the WebSocket Authenticate handshake is only stored on the connection when the user actually belongs to that tenant. It takes the same arguments as `defineWebSocketQueue` minus `connectionScopeValidator`, which it fills in for you.

The deploying service must still register the validator implementation by calling [defineTenantScopeResolver](./tenant-scope-resolver.md) (pass `linksOwner` when this service does not own the tenant stores).

```typescript
import { defineTenantedWebSocketQueue, defineTenantScopeResolver } from 'quidproquo-features';

export default [
  ...defineTenantScopeResolver({ module: 'ca' }),

  defineTenantedWebSocketQueue('my-event-bus', 'api', 'example.com', {
    userDirectoryName: 'users',
  }),
];
```

## Signature

```typescript
function defineTenantedWebSocketQueue(
  eventBusName: string,
  apiName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedTenantedWebsocketQueueSettings,
): QPQConfig;
```

`QPQConfigAdvancedTenantedWebsocketQueueSettings` is `QPQConfigAdvancedWebsocketQueueSettings` with `connectionScopeValidator` omitted — see [defineWebSocketQueue](./web-socket-queue.md#advancedsettings--qpqconfigadvancedwebsocketqueuesettings-optional) for the remaining options.

## Parameters

Same as [defineWebSocketQueue](./web-socket-queue.md#parameters): `eventBusName`, `apiName`, `rootDomain`, and `advancedSettings` (without `connectionScopeValidator`, which this always sets to `TENANT_CONNECTION_SCOPE_VALIDATOR_FN`).

## Returns

Same as [defineWebSocketQueue](./web-socket-queue.md#returns) — a `QPQConfig` array with the connection-scope validator already pointed at the tenant membership check.

## Related

- [defineWebSocketQueue](./web-socket-queue.md) — the underlying define this pre-configures.
- [defineTenantScopeResolver](./tenant-scope-resolver.md) — registers `TENANT_CONNECTION_SCOPE_VALIDATOR_FN`, the inline function this wires in by name.
- [defineTenant](./tenant.md) — the full tenant setup this connection-scope validator pairs with.
