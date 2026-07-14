---
title: defineWebSocketQueue
description: Define a managed WebSocket messaging layer — connection tracking, auth, and typed client/server messages over a WebSocket API.
---

# defineWebSocketQueue

Defines a **WebSocket queue**: a batteries-included messaging layer on top of a raw [WebSocket API](../webserver/websocket.md). Where [defineWebsocket](../webserver/websocket.md) hands you the bare `$connect`/`$disconnect`/`$default` hooks, `defineWebSocketQueue` supplies those handlers for you and wires in a built-in service that tracks live connections, authenticates clients, and exchanges typed client/server messages (ping/pong, authenticate, service request/response, state dispatch). Inbound frames are routed by message type, and outbound messages fan out to the connections registered for a user.

- **On AWS:** this define expands into several config settings, each deploying its own infrastructure:
  - a [WebSocket API](../webserver/websocket.md) (API Gateway v2 WebSocket API + Lambda) whose connect/disconnect/message handlers are the queue's built-in service entry points;
  - a [key-value store](../core/key-value-store.md) (DynamoDB table) named `qpq-wsq-<apiName>`, keyed by `id` with a `userId` index, that records each live connection so messages can be addressed to a user's connections;
  - three [globals](../core/global.md) recording the associated event-bus name, user-directory name, and connection-scope-resolver name.

```typescript
import { defineWebSocketQueue } from 'quidproquo-features';

export default [
  defineWebSocketQueue('my-event-bus', 'api', 'example.com', {
    userDirectoryName: 'users',
  }),
];
```

## How it relates to defineWebsocket

`defineWebSocketQueue` **calls** [defineWebsocket](../webserver/websocket.md) internally — you do not need to declare one yourself. It passes its own service handlers as the `eventProcessors`:

| Route | Handler wired by the queue |
| --- | --- |
| `onConnect` | Registers the new `connectionId` in the connection store. |
| `onDisconnect` | Removes the connection from the store. |
| `onMessage` | Decodes the JSON frame and dispatches on its message type (authenticate, ping, service request, …). |

Because the underlying WebSocket API is created with `apiName` equal to the `apiName` you pass here, use that same value as the `websocketApiName` argument to [askWebsocketSendMessage](../../actions/webserver/websocket/ask-websocket-send-message.md) when sending raw frames to a connection on this API.

## Signature

```typescript
function defineWebSocketQueue(
  eventBusName: string,
  apiName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedWebsocketQueueSettings,
): QPQConfig;
```

Note the return type is a `QPQConfig` (an **array** of settings), not a single setting — spread it, or return it, alongside your other config.

## Parameters

### `eventBusName` — `string` (required)

Name of the [event bus](../core/event-bus.md) the queue is associated with (stored in a global as `qpq-wsq-eb-name-<apiName>`), used to fan messages out to connections.

### `apiName` — `string` (required)

Logical name of the WebSocket API. Drives the resource names of the deployed API, the connection key-value store (`qpq-wsq-<apiName>`), and the globals — and is the value you pass as `websocketApiName` to send actions. Also used as the API subdomain.

### `rootDomain` — `string` (required)

The registered domain the WebSocket API is served under (passed straight through to the underlying [defineWebsocket](../webserver/websocket.md)).

### `advancedSettings` — `QPQConfigAdvancedWebsocketQueueSettings` (optional)

```typescript
export interface QPQConfigAdvancedWebsocketQueueSettings extends QPQConfigAdvancedSettings {
  owner?: CrossModuleOwnerWithNoResourceOverride;
  userDirectoryName?: string;
  connectionScopeResolver?: string;
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `userDirectoryName` | `string` | `''` | Name of the [user directory](../core/user-directory.md) used to authenticate clients (stored in the `qpq-wsq-kvs-name-<apiName>` global). Enables the authenticate client/server message flow. |
| `connectionScopeResolver` | `string` | `''` | Name of a registered [inline function](../core/inline-function.md) invoked with `{ userId, requestedScope }` on **every** Authenticate message, whether or not it claims a storage scope (stored in the `qpq-wsq-scope-resolver-<apiName>` global). It returns the effective scope to store on the connection (e.g. a membership-checked tenant scope for a claim, or the user's own scope for no claim), or throws to reject the authenticate. A scope claim with no resolver configured is rejected outright, leaving the connection unauthenticated. |
| `owner` | `CrossModuleOwnerWithNoResourceOverride` | – | Declares the queue's resources as owned by another module/service, so this service references them instead of deploying its own. Applied to both the WebSocket API and the connection store. |
| `deprecated` | `boolean` | `false` | Inherited from `QPQConfigAdvancedSettings`; when set, the underlying WebSocket API is not deployed. |

## Returns

A `QPQConfig` array containing: three globals, the connection [key-value store](../core/key-value-store.md), and the [WebSocket API](./websocket.md) with the queue's built-in handlers.

## Related

- [defineWebsocket](../webserver/websocket.md) — the raw WebSocket API this define builds on and configures for you.
- [defineStateDispatchOverWebsockets](./state-dispatch-over-websockets.md) — routes core State-domain dispatches to clients through this queue.
- [defineTenantedWebSocketQueue](./tenanted-web-socket-queue.md) — this define with the tenant connection-scope resolver pre-wired.
- [askWebsocketSendMessage](../../actions/webserver/websocket/ask-websocket-send-message.md) — send a raw message to a connection on the queue's API.
- [defineEventBus](../core/event-bus.md), [defineKeyValueStore](../core/key-value-store.md), [defineUserDirectory](../core/user-directory.md) — the underlying resources it depends on.
