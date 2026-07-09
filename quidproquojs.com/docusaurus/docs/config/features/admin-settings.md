---
title: defineAdminSettings
description: Wire up the quidproquo admin feature — the log-inspection dashboard and its API, WebSocket sync, storage, and alarms — in one call.
---

# defineAdminSettings

Wires up the **admin feature**: the log-service backend that powers the quidproquo admin dashboard. In a single call it declares the storage, key-value stores, HTTP API routes, WebSocket sync pipeline, error alarms, and globals that let operators authenticate, browse services, and inspect the structured logs (correlations) every quidproquo runtime writes.

`defineAdminSettings` returns a `QPQConfig` — an array of config settings you spread into a service's config. Most of the resources it declares are **owned by the log service** (the `logServiceName` you pass): they only fully materialise when that service deploys, and appear as foreign references everywhere else. This lets many services publish logs into one shared admin service.

- **On AWS:** this define does not deploy infrastructure of its own — it composes other `define*` settings ([defineStorageDrive](../core/storage-drive.md), [defineKeyValueStore](../core/key-value-store.md), [defineQueue](../core/queue.md), [defineEventBus](../core/event-bus.md), routes, and a WebSocket queue), and each of those deploys its usual AWS resources. The reads served over its routes are backed by the [askAdminGetLogs](../../actions/webserver/admin/ask-admin-get-logs.md) family of actions.

```typescript
import { defineAdminSettings } from 'quidproquo-features';
import { defineAdminUserDirectory } from 'quidproquo-features';

export default [
  // The admins' auth directory (see defineAdminUserDirectory)
  ...defineAdminUserDirectory({ owner: { module: 'log' } }),

  // The admin dashboard backend, owned by the 'log' service
  ...defineAdminSettings('log', 'example.com', {
    logRetentionDays: 90,
    services: ['api', 'workers', 'web'],
  }),
];
```

## Signature

```typescript
function defineAdminSettings(
  logServiceName: string,
  rootDomain: string,
  advancedSettings?: QPQConfigAdvancedLogSettings,
): QPQConfig;
```

## Parameters

### `logServiceName` — `string` (required)

The name of the service that **owns** the admin resources. Owner-stamped settings (the log storage drives, the admin WebSocket event bus/queues, the key-value stores, the auth and log routes, the alarm pipeline, and the [session event doc](./admin-session-event-doc.md)) only flatten into deployable resources when the deploying service matches this name; elsewhere they resolve as foreign references. Owner resolution runs at IAM-scoping time.

### `rootDomain` — `string` (required)

The root domain the admin service is hosted on. Used to stand up the admin WebSocket endpoint (`defineWebSocketQueue`) under the `qpqadmin` subdomain of this domain.

### `advancedSettings` — `QPQConfigAdvancedLogSettings` (optional)

```typescript
export interface QPQConfigAdvancedLogSettings extends QPQConfigAdvancedSettings {
  logRetentionDays?: number;
  coldStorageAfterDays?: number;
  claudeAiApiKeySecretName?: string;
  services?: string[];
}
```

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `logRetentionDays` | `number` | – (no expiry) | How many days to keep the raw log objects on the logs storage drive before they are deleted. When unset, logs never expire. If `coldStorageAfterDays` is set, the effective retention is padded so that it is at least `coldStorageAfterDays + 180` days — logs always outlive the cold-storage transition window. |
| `coldStorageAfterDays` | `number` | – (no transition) | When greater than 0, adds a lifecycle rule transitioning log objects to the `DEEP_COLD_STORAGE` tier after this many days, to cut storage cost for old logs. |
| `claudeAiApiKeySecretName` | `string` | `''` | Name of the secret holding a Claude AI API key, exposed to the admin service as the `claudeAi-api-key` global. Enables the admin dashboard's log-chat feature (asking questions about a log with Claude). |
| `services` | `string[]` | `[]` | The list of service names the admin dashboard should surface, exposed as the `qpq-serviceNames` global. Returned by the `/admin/services` route. |
| `deprecated` | `boolean` | `false` | Inherited from `QPQConfigAdvancedSettings`; marks the log storage drives and key-value stores as deprecated. |

## What it declares

`defineAdminSettings` returns a `QPQConfig` array composed of:

- **Log storage** — a `QPQ_LOGS_STORAGE_DRIVE_NAME` storage drive (with an `onCreate` handler and the retention / cold-storage lifecycle rules), plus a `QPQ_LOG_REPORTS_STORAGE_DRIVE_NAME` drive (30-day retention) for generated reports.
- **Log indexes** — key-value stores for correlations (indexed by `runtimeType` and `fromCorrelation`, both sorted by `startedAt`, with a `ttl` attribute), log messages, and a log list.
- **Auth routes** — `POST /login`, `POST /refreshToken`, `POST /challenge`, authenticated against the [admin user directory](./admin-user-directory.md).
- **Log routes** — `GET /admin/services`, `POST /log/list`, `GET /log/{correlationId}`, its `/toggle`, `/children`, `/hierarchies`, `/downloadurl`, the log-log list, and the `/log/chat` message endpoints — all (except the service list) requiring an admin token.
- **WebSocket sync** — an admin event bus (`qpq-admin-wsq`), a `defineWebSocketQueue`, and queues that fan out client messages (config sync, mark-log-checked, refresh-metadata) using `WebsocketAdminClientMessageEventType`.
- **Alarms** — a `defineNotifyError` publishing to an `admin-notifier` event bus, with a queue handling its Error / Timeout / Throttle events.
- **Globals** — `qpq-serviceNames`, `qpq-log-retention-days`, and `claudeAi-api-key`.
- **Audit sessions** — spreads in [defineAdminSessionEventDoc](./admin-session-event-doc.md) for the admin UI's per-login session document.

## Examples

```typescript
import { defineAdminSettings, defineAdminUserDirectory } from 'quidproquo-features';

export default [
  ...defineAdminUserDirectory({ owner: { module: 'log' } }),

  // Retain logs 30 days, move to deep cold storage after 7,
  // enable the Claude log-chat feature.
  ...defineAdminSettings('log', 'example.com', {
    logRetentionDays: 30,
    coldStorageAfterDays: 7,
    claudeAiApiKeySecretName: 'claude-api-key',
    services: ['api', 'workers'],
  }),
];
```

## Related

- [defineAdminUserDirectory](./admin-user-directory.md) — the directory admins authenticate against; declare it alongside these settings.
- [defineAdminSessionEventDoc](./admin-session-event-doc.md) — the per-login admin session document, spread in by this define.
- [askAdminGetLogs](../../actions/webserver/admin/ask-admin-get-logs.md), [askAdminGetLog](../../actions/webserver/admin/ask-admin-get-log.md), [askAdminGetLogMetadata](../../actions/webserver/admin/ask-admin-get-log-metadata.md) — the actions the admin log routes are built from.
- [defineStorageDrive](../core/storage-drive.md), [defineKeyValueStore](../core/key-value-store.md), [defineQueue](../core/queue.md), [defineEventBus](../core/event-bus.md) — the core settings this feature composes.
