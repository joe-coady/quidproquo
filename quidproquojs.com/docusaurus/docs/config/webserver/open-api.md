---
title: defineOpenApi
description: Point a service at an OpenAPI spec file describing its HTTP API.
---

# defineOpenApi

Registers an **OpenAPI spec** for the service by pointing at a spec file on disk. This associates a machine-readable description of the service's HTTP API with the config.

- **On AWS:** no infrastructure of its own — it records the spec path in the config. The generated spec is retrievable at runtime with [askGetOpenApiSpec](../../actions/webserver/open-api-spec/ask-get-open-api-spec.md).

```typescript
import { defineOpenApi } from 'quidproquo-webserver';

export default [
  defineOpenApi('./openapi.json'),
];
```

## Signature

```typescript
function defineOpenApi(openApiSpecPath: string): OpenApiQPQWebServerConfigSetting;
```

## Parameters

### `openApiSpecPath` — `string` (required)

Path to the OpenAPI spec file for the service. This value is also the setting's `uniqueKey`.

## Related

- [askGetOpenApiSpec](../../actions/webserver/open-api-spec/ask-get-open-api-spec.md) — read the OpenAPI spec from within a story.
- [defineApi](./api.md) — the HTTP API the spec describes.
- [defineRoute](./route.md) — the routes that make up the API surface.
