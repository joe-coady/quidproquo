---
title: defineAwsKmsKey
description: Register a customer-managed KMS key to encrypt a storage drive or key-value store.
---

# defineAwsKmsKey

Registers an existing **customer-managed KMS key** (by ARN) and binds it to a specific [storage drive](../core/storage-drive.md) or [key-value store](../core/key-value-store.md). It is the AWS-side companion to the `encryption: true` flag on those resources: when a drive or store opts into customer-managed encryption, this setting tells the deploy which KMS key to use. Without a matching key registered here, the `encryption` flag has no key to reference.

- **On AWS:** looked up by `getAwsKmsKeyForStorageDrive` / `getAwsKmsKeyForKeyValueStore` in `quidproquo-config-aws`, keyed by target type + resource name + owning module. `QpqCoreStorageDriveConstruct` and `QpqCoreKeyValueStoreConstruct` in `quidproquo-deploy-awscdk` resolve the key with `aws_kms.Key.fromKeyArn(...)` and set it as the bucket / table `encryptionKey`. The deploy also grants the service's roles the KMS actions (`kms:Decrypt`, `kms:GenerateDataKey*`, `kms:Encrypt`, `kms:ReEncrypt*`, `kms:DescribeKey`) needed to use the key. The key itself is referenced, not created — you provision and manage the key (and its key policy) separately.

```typescript
import { defineAwsKmsKey, AwsKmsKeyTargetType } from 'quidproquo-config-aws';

export default [
  defineAwsKmsKey(
    'uploads-key',
    'arn:aws:kms:us-east-1:123456789012:key/abcd-1234-...',
    AwsKmsKeyTargetType.storageDrive,
    { name: 'user-uploads', module: 'my-service' },
  ),
];
```

## Signature

```typescript
function defineAwsKmsKey(
  keyname: string,
  arn: string,
  type: AwsKmsKeyTargetType,
  owner: AwsKmsKeyOwner,
): AwsKmsKeyQPQConfigSetting;
```

## Parameters

### `keyname` — `string` (required)

A unique name for this key registration (its `uniqueKey` within the config). An identifier for the entry — not the AWS key alias.

### `arn` — `string` (required)

The ARN of the existing customer-managed KMS key. This exact ARN is imported via `Key.fromKeyArn`.

### `type` — `AwsKmsKeyTargetType` (required)

Which kind of data store this key encrypts. The lookup matches on this together with the owner, so a store only picks up a key registered for its own resource type.

| Value | Encrypts |
| --- | --- |
| `storageDrive` | A [storage drive](../core/storage-drive.md) (S3 bucket) with `encryption: true`. |
| `keyValueStore` | A [key-value store](../core/key-value-store.md) (DynamoDB table) with `encryption: true`. |

### `owner` — `AwsKmsKeyOwner` (required)

Identifies the resource the key belongs to. Both fields are matched against the target store at deploy time.

```typescript
type AwsKmsKeyOwner = {
  name: string;    // the storage-drive / key-value-store name
  module: string;  // the module that owns that resource
};
```

- **`name`** — the storage-drive or key-value-store name (matches the value passed to `defineStorageDrive` / `defineKeyValueStore`).
- **`module`** — the module that owns that resource. For a store owned by the current service this is the service's own module name; set it to another module to key a foreign resource.

## Examples

```typescript
import { defineKeyValueStore } from 'quidproquo-core';
import { defineStorageDrive } from 'quidproquo-core';
import { defineAwsKmsKey, AwsKmsKeyTargetType } from 'quidproquo-config-aws';

export default [
  // A drive and a store that both request customer-managed encryption
  defineStorageDrive('user-uploads', { encryption: true }),
  defineKeyValueStore('billing', 'invoiceId', { encryption: true }),

  // Bind each to its KMS key
  defineAwsKmsKey(
    'uploads-key',
    'arn:aws:kms:us-east-1:123456789012:key/uploads-...',
    AwsKmsKeyTargetType.storageDrive,
    { name: 'user-uploads', module: 'my-service' },
  ),
  defineAwsKmsKey(
    'billing-key',
    'arn:aws:kms:us-east-1:123456789012:key/billing-...',
    AwsKmsKeyTargetType.keyValueStore,
    { name: 'billing', module: 'my-service' },
  ),
];
```

## Related

- [defineStorageDrive](../core/storage-drive.md) — its `encryption` flag selects a key registered here.
- [defineKeyValueStore](../core/key-value-store.md) — its `encryption` flag selects a key registered here.
