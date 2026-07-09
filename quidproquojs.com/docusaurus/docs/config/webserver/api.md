---
title: defineApi
description: Define an HTTP API — the public web endpoint (a custom subdomain fronting an API Gateway REST API on AWS) that a service's routes are served under.
---

# defineApi

Defines an **API**: the public HTTP endpoint for a service. An API declares the subdomain and root domain the service is reachable on; every [route](./route.md) you declare in the same service is served under it. A service typically declares exactly one API.

- **On AWS:** deploys a **regional API Gateway REST API** (`LambdaRestApi`, proxy mode, binary media types `*/*`) backed by a single Lambda that handles every route (`ApiQpqWebserverApiConstruct` in `quidproquo-deploy-awscdk`). The API is attached to a custom domain (`apiSubdomain.rootDomain`) via a base-path mapping keyed on the module name, so multiple modules can share one domain. Access logs (JSON, one-year retention) and CloudWatch metrics are enabled; a 5XX alarm is wired by default, plus 401/403 rate alarms when error notifications are configured. When WAF protection is enabled for the deploy, the shared regional Web ACL is associated with the stage.

```typescript
import { defineApi } from 'quidproquo-webserver';

export default [
  defineApi('api', 'example.com'),
];
```

This serves the service's routes at `https://api.<module-base>.example.com/<module>/...`.

## Signature

```typescript
function defineApi(
  apiName: string,
  rootDomain: string,
  options?: QPQConfigAdvancedApiSettings,
): ApiQPQWebServerConfigSetting;
```

## Parameters

### `apiName` — `string` (required)

The API's name and its `uniqueKey` within the config. Unless overridden by `options.subDomain`, it is also the **subdomain** the API is served on (so `defineApi('api', 'example.com')` serves on `api.<...>.example.com`).

### `rootDomain` — `string` (required)

The root domain the API is hosted under, e.g. `'example.com'`. The deploy derives the full hostname from this plus the environment/feature and the API subdomain, so the same config deploys to multiple environments without collisions.

### `options` — `QPQConfigAdvancedApiSettings` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `subDomain` | `string` | `apiName` | Override the subdomain the API is served on. Use it when the API name and the public subdomain should differ. |
| `cloudflareApiKeySecretName` | `string` | – | Name of the secret holding the Cloudflare API key, used when DNS/records for the API are managed through Cloudflare. |
| `virtualNetworkName` | `string` | – | Name of a `defineVirtualNetwork` (VPC) to place the API's Lambda in. Required to reach in-VPC data stores; the Lambda joins that network's bootstrap-created workload security group. |
| `maxConcurrentExecutions` | `number` | – | Reserved concurrency for the API's Lambda — a cap **and** a guarantee on concurrent requests across all routes (one compute unit serves every route). Carved out of the account's shared concurrency pool. |
| `deprecated` | `boolean` | `false` | Marks the API as deprecated. Inherited from `QPQConfigAdvancedSettings`. |

## Examples

```typescript
import { defineApi, defineRoute } from 'quidproquo-webserver';

export default [
  // Serve on a custom subdomain, capped at 50 concurrent requests
  defineApi('public', 'example.com', {
    subDomain: 'api',
    maxConcurrentExecutions: 50,
  }),

  // Routes declared in the same service are served under the API
  defineRoute('GET', '/health', '/src/routes/health::getHealth'),
];
```

## Related

- [defineRoute](./route.md) — declares the individual method+path endpoints served under the API.
- [defineDefaultRouteOptions](./default-route-options.md) — service-wide defaults (CORS, auth) merged into every route.
- [defineServiceFunction](./service-function.md) — RPC-style callable functions, deployed as their own Lambdas rather than under the API.
- [defineDomainCertificate](../config-aws/domain-certificate.md) — the ACM certificate for the API's domain (resolved with the same `rootDomain` prefixing).
- [defineWafProtection](../config-aws/waf-protection.md) — opt the API Gateway stage into the app's WAF web ACL.
