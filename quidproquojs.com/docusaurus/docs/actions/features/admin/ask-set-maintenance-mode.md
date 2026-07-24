---
title: askSetMaintenanceMode
description: Broadcast a maintenance begin/end notice to every connection on the application's WebSocket queue.
---

# askSetMaintenanceMode

Broadcasts a maintenance begin/end message to every live connection on the **application** [WebSocket queue](../../../config/features/web-socket-queue.md) (the queue named by [defineAdminSettings](../../../config/features/admin-settings.md)'s `maintenanceWebsocketApiName` — not the admin dashboard's own socket). It backs the admin dashboard's `POST /maintenance/set` route: an operator flips maintenance on with a level and message, and every connected frontend is notified immediately; flipping it off sends a second message ending it.

- **Built from:** [askWebSocketQueueBroadcastMessage](../web-socket-queue/ask-web-socket-queue-broadcast-message.md), sending a `WebSocketQueueServerMessageEventType.Maintenance` message. It is a composed story, not a single action.

```typescript
import { askSetMaintenanceMode } from 'quidproquo-features';
import { WebSocketQueueMaintenanceLevel } from 'quidproquo-features';

export function* beginMaintenance() {
  yield* askSetMaintenanceMode({
    active: true,
    level: WebSocketQueueMaintenanceLevel.High,
    message: 'The site is undergoing a scheduled update',
  });
}

export function* endMaintenance() {
  yield* askSetMaintenanceMode({ active: false, level: WebSocketQueueMaintenanceLevel.High });
}
```

## Signature

```typescript
function* askSetMaintenanceMode(
  maintenance: WebSocketQueueServerEventPayloadMaintenance,
): AskResponse<void>;
```

## Parameters

### `maintenance` — `WebSocketQueueServerEventPayloadMaintenance` (required)

```typescript
export type WebSocketQueueServerEventPayloadMaintenance = {
  active: boolean;
  level: WebSocketQueueMaintenanceLevel;
  message?: string;
};
```

| Property | Type | Description |
| --- | --- | --- |
| `active` | `boolean` | `true` to begin maintenance, `false` to end it. |
| `level` | `WebSocketQueueMaintenanceLevel` | `Low` — informational, users can keep working. `High` — critical, frontends should lock the UI until the matching `active: false` message arrives. |
| `message` | `string` | Optional human-readable notice to show the user. |

## Returns

`void`

## Errors

This story throws a core qpq error via [askThrowError](../../core/error/ask-throw-error.md) rather than defining its own error enum:

| Error | Meaning |
| --- | --- |
| `ErrorTypeEnum.NotFound` | No `maintenanceWebsocketApiName` is configured on [defineAdminSettings](../../../config/features/admin-settings.md), so there is no application WebSocket queue to broadcast on. |

## Related

- [defineAdminSettings](../../../config/features/admin-settings.md) — declares the `POST /maintenance/set` route this story backs, and the `maintenanceWebsocketApiName` it broadcasts on.
- [askWebSocketQueueBroadcastMessage](../web-socket-queue/ask-web-socket-queue-broadcast-message.md) — the underlying broadcast this story sends.
- [defineWebSocketQueue](../../../config/features/web-socket-queue.md) — declares the application WebSocket queue named by `maintenanceWebsocketApiName`.
