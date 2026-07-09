---
title: askDnsList
description: List the base DNS domains a service has declared.
---

# askDnsList

Returns the list of base DNS domains the service has declared with [defineDns](../../../config/webserver/dns.md). Use it when a story needs to know which root domain(s) the service is served under.

- **Action type:** `DnsActionType.List`

```typescript
import { askDnsList } from 'quidproquo-webserver';

export function* askPrimaryDomain() {
  const domains = yield* askDnsList();
  return domains[0];
}
```

## Signature

```typescript
function* askDnsList(): AskResponse<string[]>;
```

Takes no arguments.

## Returns

`string[]` — the `dnsBase` values from every [defineDns](../../../config/webserver/dns.md) config in the service. Typically a single entry.

- **On AWS:** this does **not** query Route53. The processor reads the service's own config and maps each DNS config to its `dnsBase`, so the result is exactly what was declared with `defineDns` — no live DNS lookup is performed.

## Related

- [defineDns](../../../config/webserver/dns.md) — declares the domains this action returns.
