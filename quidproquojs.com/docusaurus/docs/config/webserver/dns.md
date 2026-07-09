---
title: defineDns
description: Declare the base DNS domain a service lives under, so every domain, certificate, and DNS record it deploys hangs off one root.
---

# defineDns

Declares the **base DNS domain** for a service. Everything else in quidproquo-webserver that needs a hostname — API custom domains, web entries, [domain proxies](./domain-proxy.md), and [subdomain redirects](./subdomain-redirect.md) — derives its fully-qualified name from this single `dnsBase`. A service has one DNS base.

- **On AWS:** `defineDns` does **not** create a Route53 hosted zone by itself. The hosted zone for `dnsBase` (after environment/feature prefixing) must already exist in Route53 — deploy constructs look it up with `HostedZone.fromLookup`, then add the `A` records they need into that existing zone. Think of `defineDns` as declaring "this is my root domain"; the zone that owns it is expected to be there already.

```typescript
import { defineDns } from 'quidproquo-webserver';

export default [
  defineDns('example.com'),
];
```

## Signature

```typescript
function defineDns(
  dnsBase: string,
): DnsQPQWebServerConfigSetting;
```

## Parameters

### `dnsBase` — `string` (required)

The root domain the service is served from, e.g. `'example.com'`. This value becomes the config's `uniqueKey` and is the base that all of the service's hostnames are built on. quidproquo prefixes it per environment and feature before use, so a single config deploys cleanly to multiple environments:

- In `production` the base stays `example.com`.
- In another environment it becomes `<environment>.example.com` (e.g. `development.example.com`).
- With a feature branch it becomes `<feature>.<environment>.example.com`.
- A service's own resources then live under `<service>.<base>` (e.g. an API at `api.<service>.development.example.com`).

The list of declared bases is what [askDnsList](../../actions/webserver/dns/ask-dns-list.md) returns at runtime.

## Examples

```typescript
import { defineDns } from 'quidproquo-webserver';

export default [
  // Serve this service under example.com (and its env/feature-prefixed variants)
  defineDns('example.com'),
];
```

## Related

- [askDnsList](../../actions/webserver/dns/ask-dns-list.md) — returns the `dnsBase` values declared with `defineDns`.
- [defineCertificate](./certificate.md) — TLS certificate for a domain rooted at this base.
- [defineDomainProxy](./domain-proxy.md) — front a domain under this base with CloudFront.
- [defineSubdomainRedirect](./subdomain-redirect.md) — redirect a subdomain under this base to another URL.
