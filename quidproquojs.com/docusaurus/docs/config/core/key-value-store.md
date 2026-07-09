---
title: defineKeyValueStore
description: Define a key-value store — a DynamoDB-style table with a partition key, optional sort keys, and secondary indexes that KVS actions read from and write to.
---

# defineKeyValueStore

Defines a **key-value store**: a named, schema-light table addressed by a partition key and optional sort key(s). Stories never talk to DynamoDB directly — they read and write records on a store by name using the [Key-Value Store action requesters](../../actions/core/key-value-store/ask-key-value-store-get.md), and the runtime maps the store to real storage.

- **On AWS:** deploys a DynamoDB table (`QpqCoreKeyValueStoreConstruct` in `quidproquo-deploy-awscdk`). The table uses **on-demand** billing (`PAY_PER_REQUEST`), the `partitionKey` becomes the table's partition (hash) key, the **first** entry in `sortKeys` becomes the table's sort (range) key, and each **additional** sort key becomes a **Local Secondary Index**. Every entry in `indexes` becomes a **Global Secondary Index** (its `indexName` is the index's partition-key attribute name). Point-in-time recovery (35-day continuous backups) is on by default, `ttlAttribute` maps to the table's TTL attribute, and read/write-throttle CloudWatch alarms are attached. The table is retained on stack teardown unless the service opts into destroy via `defineAwsDataStoreRemovalPolicy`.

```typescript
import { defineKeyValueStore } from 'quidproquo-core';

export default [
  // Partition key only
  defineKeyValueStore('users', 'userId'),
];
```

## Signature

```typescript
function defineKeyValueStore<T extends object = any>(
  keyValueStoreName: string,
  partitionKey: CompositeKvsKey<T>,
  sortKeys?: CompositeKvsKey<T>[],
  options?: QPQConfigAdvancedKeyValueStoreSettings<T>,
): KeyValueStoreQPQConfigSetting<T>;
```

## Parameters

### `keyValueStoreName` — `string` (required)

The name of the store. This is the name you pass as the first argument to every KVS action (e.g. `askKeyValueStoreGet('users', ...)`). It is also the store's `uniqueKey` within the config, and on AWS it is used to derive the physical table name (prefixed with application/module/environment, so the same config deploys to multiple environments without collisions).

### `partitionKey` — `CompositeKvsKey<T>` (required)

The partition (hash) key. Every record is addressed primarily by this attribute. See [Keys](#keys-compositekvskey) for the shorthand and full forms.

### `sortKeys` — `CompositeKvsKey<T>[]` (default `[]`)

Zero or more sort keys. The list is significant:

- The **first** sort key becomes the table's sort (range) key — together with the partition key it forms the composite primary key, and it is what [askKeyValueStoreQuery](../../actions/core/key-value-store/ask-key-value-store-query.md) ranges over.
- Each **additional** sort key becomes a **Local Secondary Index** (same partition key, alternate sort attribute), letting you query the same partition ordered by a different attribute.

### `options` — `QPQConfigAdvancedKeyValueStoreSettings<T>` (optional)

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `indexes` | `CompositeKvsIndex<T>[]` | `[]` | Global Secondary Indexes — alternate partition/sort key pairs that let you query the store by attributes other than the primary key. See [Indexes (GSIs)](#indexes-gsis). |
| `global` | `boolean` | `false` | Marks the store as globally accessible across the account rather than private to the owning module. |
| `owner` | `CrossModuleOwner` | – | Declares that this store is owned by **another** module/service. Use this to read/write a store deployed elsewhere: the deploy grants this service IAM access to the foreign table instead of creating a new one. |
| `ttlAttribute` | `string` | – | Name of a record attribute holding a Unix-epoch (seconds) timestamp. DynamoDB automatically deletes records once that time passes. |
| `disablePointInTimeRecovery` | `boolean` | `false` | Point-in-time recovery (35-day continuous backups / restore) is on by default; set this to opt out. |
| `encryption` | `boolean` | `false` | Enables customer-managed KMS encryption for the table (the KMS key comes from the service's AWS config). When a customer-managed key isn't configured, AWS-managed encryption is used instead; when `false`, DynamoDB's default provider-managed encryption still applies. |

## Keys (`CompositeKvsKey`)

A key can be given in two forms:

```typescript
// Shorthand: just the attribute name — implies type 'string'
defineKeyValueStore('users', 'userId');

// Full form: name + explicit type, via the kvsKey() helper
import { defineKeyValueStore, kvsKey } from 'quidproquo-core';

defineKeyValueStore('events', kvsKey('deviceId'), [kvsKey('timestamp', 'number')]);
```

`kvsKey(key, type)` builds a `KvsKey` — `{ key, type }`. The `type` is a `KvsKeyType`:

| `KvsKeyType` | Meaning |
| --- | --- |
| `'string'` | Textual key (default when using the shorthand form). |
| `'number'` | Numeric key — sorts and ranges numerically. |
| `'binary'` | Binary key. |

## Indexes (GSIs)

Each entry in `options.indexes` is a `CompositeKvsIndex<T>` — either a bare attribute name (a partition-key-only index) or an object with a `partitionKey` and optional `sortKey`:

```typescript
import { defineKeyValueStore, kvsKey } from 'quidproquo-core';

defineKeyValueStore('orders', 'orderId', [], {
  indexes: [
    // Query orders by customer, ordered by createdAt
    { partitionKey: 'customerId', sortKey: kvsKey('createdAt', 'number') },
    // Query orders by status (partition-only index)
    'status',
  ],
});
```

On AWS each index becomes a Global Secondary Index whose name is the index's partition-key attribute (`customerId`, `status` above).

## Examples

```typescript
import { defineKeyValueStore, kvsKey } from 'quidproquo-core';

export default [
  // Simple lookup table keyed by id
  defineKeyValueStore('users', 'userId'),

  // Time-series: partition per device, ranged by numeric timestamp,
  // with a TTL attribute so old rows expire automatically
  defineKeyValueStore('device-readings', 'deviceId', [kvsKey('timestamp', 'number')], {
    ttlAttribute: 'expiresAt',
  }),

  // Orders with a GSI to query by customer
  defineKeyValueStore('orders', 'orderId', [], {
    indexes: [{ partitionKey: 'customerId', sortKey: kvsKey('createdAt', 'number') }],
  }),

  // Encrypted store using a store owned by another service
  defineKeyValueStore('billing', 'accountId', [], {
    encryption: true,
    owner: { module: 'billing-service' },
  }),
];
```

## Related

- **Read a single record:** [askKeyValueStoreGet](../../actions/core/key-value-store/ask-key-value-store-get.md) · [askKeyValueStoreGetAll](../../actions/core/key-value-store/ask-key-value-store-get-all.md)
- **Query & scan:** [askKeyValueStoreQuery](../../actions/core/key-value-store/ask-key-value-store-query.md) · [askKeyValueStoreScan](../../actions/core/key-value-store/ask-key-value-store-scan.md)
- **Write:** [askKeyValueStoreUpsert](../../actions/core/key-value-store/ask-key-value-store-upsert.md) · [askKeyValueStoreUpdate](../../actions/core/key-value-store/ask-key-value-store-update.md) · [askKeyValueStoreDelete](../../actions/core/key-value-store/ask-key-value-store-delete.md)
- **AWS tuning:** [defineAwsKmsKey](../config-aws/aws-kms-key.md) (customer-managed encryption key for the `encryption` flag), [defineAwsDyanmoOverrideForKvs](../config-aws/aws-dyanmo-override-for-kvs.md) (back the store with a pre-existing DynamoDB table), and [defineAwsDataStoreRemovalPolicy](../config-aws/aws-data-store-removal-policy.md) (retain vs destroy the table on teardown).
- **AWS implementation:** `QpqCoreKeyValueStoreConstruct` (DynamoDB table, LSIs, GSIs, TTL, PITR, KMS, IAM grants) in `quidproquo-deploy-awscdk`; KVS action processors in `quidproquo-actionprocessor-awslambda`.
