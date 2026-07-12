---
title: defineTenantStores
description: Declare the data stores for the tenant feature, the tenant event-doc collection, the materialized record table, and the user-tenant membership links.
---

# defineTenantStores

Declares the **stores** that back the tenant (org) feature, without any routes or inline functions. It returns a `QPQConfig` (an array of config settings) that expands to:

1. The **tenant event-doc collection**: a [defineEventDocSummary](./event-doc-summary.md) call for the `tenants` store (summary table, append-only event log, and asset drive). This is the audit-trailed source of truth for tenant state.
2. The **materialized tenant record store**: a [key-value store](../core/key-value-store.md) named `tenantRecords` (partition key `tenantId`). A fast-read table synced from the event doc on publish; it is never written directly by request handlers.
3. The **user-tenant membership links store**: a [key-value store](../core/key-value-store.md) named `userTenantLinks` (partition key `userId`). Each row maps a `userId` to the list of `tenantIds` that user belongs to.

- **On AWS:** deploys everything [defineEventDocSummary](./event-doc-summary.md) deploys (two DynamoDB tables plus an S3 bucket), plus two more DynamoDB tables (via [defineKeyValueStore](../core/key-value-store.md)) for the record and membership stores.

```typescript
import { defineTenantStores } from 'quidproquo-features';

export default [
  ...defineTenantStores(),
];
```

You rarely call this directly: [defineTenant](./tenant.md) composes it along with the routes and inline functions. Call it on its own only when you want the stores without the tenant routes.

## Signature

```typescript
function defineTenantStores(): QPQConfig;
```

## Parameters

None. All store names are fixed constants exported from `quidproquo-features`:

| Constant | Value | Store |
| --- | --- | --- |
| `TENANT_EVENTDOC_STORE` | `'tenants'` | The tenant event-doc collection. |
| `TENANT_RECORD_STORE` | `'tenantRecords'` | The materialized tenant record table. |
| `USER_TENANT_LINKS_STORE` | `'userTenantLinks'` | The userId to tenantIds membership table. |

## Store row shapes

The record store holds `TenantRecord` rows, derived from the tenant event doc on publish:

```typescript
type TenantRecord = {
  tenantId: string;
  name: string;
  brandColors?: Record<string, string>;
  logoUrl?: string;
  createdAt: QpqIsoDateTime;
  updatedAt: QpqIsoDateTime;
  createdByUserId: string;
  status: TenantStatus;
};
```

The membership store holds `UserTenantLinks` rows:

```typescript
type UserTenantLinks = {
  userId: string;
  tenantIds: string[];
};
```

## Notes

- The tenant event-doc collection is the source of truth; the `tenantRecords` table is a read model. The sync between them is the `askTenantOnPublish` inline function, which [defineTenant](./tenant.md) registers and wires into the collection's `onPublish` hook.
- Creating a tenant appends its id to the caller's `UserTenantLinks` row, so the creator becomes the tenant's first member.
- Services that do **not** own these stores but still need to membership-check tenants should not call `defineTenantStores` again. Instead they call [defineTenantScopeResolver](./tenant-scope-resolver.md) with a `linksOwner`, which re-declares the membership table as a cross-module reference.

## Related

- [defineTenant](./tenant.md): composes these stores with the routes and inline functions; the usual entry point.
- [defineTenantScopeResolver](./tenant-scope-resolver.md): the scope-resolver half; validates against the membership store declared here.
- [defineEventDocSummary](./event-doc-summary.md): the event-doc store helper this composes for the `tenants` collection.
- [defineKeyValueStore](../core/key-value-store.md): the core setting behind the record and membership tables.
