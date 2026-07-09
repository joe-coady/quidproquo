---
title: defineDomainCertificate
description: Issue a real ACM certificate with DNS validation for a root domain and its subdomains.
---

# defineDomainCertificate

Issues a real **ACM (AWS Certificate Manager) certificate**, DNS-validated against a Route 53 hosted zone, for a root domain and a set of subdomains. This is the concrete certificate that API Gateway and CloudFront distributions use for HTTPS. The webserver [`defineCertificate`](../webserver/certificate.md) is a portable shim that ultimately defers to a domain certificate like this one on AWS.

- **On AWS:** each unique `(region, rootDomain)` becomes a `DomainCertificateStack` (via `createDomainCertificateStacks` in `quidproquo-deploy-awscdk`). The stack resolves the root domain through the same environment/feature prefixing as [`defineApi`](../webserver/api.md) (`resolveDomainRoot`), so `rootDomain: "example.com"` in a dev deploy issues against `development.example.com`. It looks up the hosted zone, creates an `aws_certificatemanager.Certificate` with `CertificateValidation.fromDns(...)` covering the resolved subdomains (and the apex when `includeApex`), and publishes the cert ARN to SSM (keyed by region + root domain) — writing cross-region via a custom resource when the cert region differs from the deploy region. Entries sharing a `(region, rootDomain)` are merged into one cert covering the union of their names.

```typescript
import { defineDomainCertificate } from 'quidproquo-config-aws';

export default [
  // A cert for api.example.com and admin.example.com in the deploy region
  defineDomainCertificate('example.com', 'us-east-1', ['api', 'admin']),
];
```

## Signature

```typescript
function defineDomainCertificate(
  rootDomain: string,
  region: string,
  subdomains: string[],
  options?: { includeApex?: boolean },
): DomainCertificateQPQConfigSetting;
```

## Parameters

### `rootDomain` — `string` (required)

The base, un-prefixed apex domain — the same value you pass to `defineApi` / web-entry `rootDomain` fields. At synth time it is resolved against the config's environment and feature (a dev deploy of `"example.com"` becomes `development.example.com`, or `myfeature.development.example.com`). Together with `region` it forms the setting's `uniqueKey`.

### `region` — `string` (required)

The AWS region to issue the certificate in. CloudFront requires certificates in `us-east-1`, while regional API Gateway certs live in the deploy region — declaring both for the same apex is a valid, merged case.

### `subdomains` — `string[]` (required)

The subdomain labels to cover, each combined with the resolved apex (e.g. `'api'` → `api.<resolved-apex>`). At least one subdomain must be declared unless `includeApex` is `true`, or synth throws.

### `options` — `{ includeApex?: boolean }` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `includeApex` | `boolean` | `false` | Also cover the resolved apex domain itself (in addition to the subdomains). Merged entries OR this flag together. |

## Examples

```typescript
import { defineDomainCertificate } from 'quidproquo-config-aws';

export default [
  // Regional API cert in the deploy region
  defineDomainCertificate('example.com', 'us-east-1', ['api']),

  // CloudFront cert (must be us-east-1) covering the apex and www
  defineDomainCertificate('example.com', 'us-east-1', ['www'], { includeApex: true }),
];
```

## Related

- [defineCertificate](../webserver/certificate.md) — the portable webserver shim that defers to this real ACM certificate on AWS.
- [defineApi](../webserver/api.md) — its `rootDomain` uses the same resolution as this certificate's `rootDomain`.
