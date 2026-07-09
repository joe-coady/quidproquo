---
title: askGetOpenApiSpec
description: Return the service's generated OpenAPI spec as a string.
---

# askGetOpenApiSpec

Returns the service's **OpenAPI spec** as a string. Use it in a route handler to serve the spec (for documentation UIs or client generation) directly from the running service.

- **Action type:** `OpenApiSpecActionType.GetOpenApiSpec`

```typescript
import { askGetOpenApiSpec } from 'quidproquo-webserver';

export function* getOpenApiRoute() {
  const spec = yield* askGetOpenApiSpec();

  return {
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: spec,
  };
}
```

## Signature

```typescript
function* askGetOpenApiSpec(): AskResponse<string>;
```

## Parameters

None.

## Returns

`string` — the OpenAPI spec. Associate a spec with the service using [defineOpenApi](../../../config/webserver/open-api.md).

## Related

- [defineOpenApi](../../../config/webserver/open-api.md) — declares the spec this action returns.
- [defineRoute](../../../config/webserver/route.md) — expose the spec at an HTTP path.
