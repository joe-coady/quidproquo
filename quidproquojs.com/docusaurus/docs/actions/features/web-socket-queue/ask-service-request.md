---
title: askServiceRequest
description: Send an RPC-style request to another qpq service, identified by a method name, and receive its typed response.
---

# askServiceRequest

Sends an **RPC-style request to another qpq service**, identified by a service name and a method name, with a typed payload, and returns the service's typed response. It is the low-level action behind the `createServiceRequester` helper, which binds a service + method into a reusable, typed requester.

- **Action type:** `ServiceActionType.Request`
- The request is dispatched as a `qpq/serviceRequest/<serviceName>/<method>` message and its correlated response is awaited. In a browser (quidproquo-web-react) client this travels over the app's WebSocket queue connection; the response is returned when the correlated reply arrives.

```typescript
import { askServiceRequest } from 'quidproquo-features';

interface GetQuoteRequest { symbol: string; }
interface GetQuoteResponse { symbol: string; price: number; }

export function* askGetQuote(symbol: string) {
  const quote = yield* askServiceRequest<GetQuoteRequest, GetQuoteResponse>(
    'market',   // service name
    'getQuote', // method
    { symbol },
  );

  return quote.price;
}
```

Prefer `createServiceRequester` for a typed, reusable wrapper:

```typescript
import { createServiceRequester } from 'quidproquo-features';

// Bind the service + method once, with request/response types
const askGetQuote = createServiceRequester<GetQuoteRequest, GetQuoteResponse>('market', 'getQuote');

export function* askQuotePrice(symbol: string) {
  const quote = yield* askGetQuote({ symbol });
  return quote.price;
}
```

## Signature

```typescript
function* askServiceRequest<TPayload, TResponse>(
  serviceName: string,
  method: string,
  payload: TPayload,
): AskResponse<TResponse>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `serviceName` | `string` | Name of the target service. |
| `method` | `string` | The service method to invoke — combined with `serviceName` into the request event type. |
| `payload` | `TPayload` | The typed request payload. |

## Returns

`TResponse` — the typed response returned by the target service's handler for that method.

## Related

- [askServiceFunctionExecute](../../webserver/service-function/ask-service-function-execute.md) — direct Lambda-invoke of a named service function.
- [defineWebSocketQueue](../../../config/features/web-socket-queue.md) — the WebSocket queue this request travels over in a browser client.
- [askCatch](../../core/system/ask-catch.md) — catch errors returned by the service handler.
