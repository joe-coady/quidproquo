---
title: askFileWriteBinaryContents
description: Write binary data to a file on a storage drive.
---

# askFileWriteBinaryContents

Writes binary data to a file on a [storage drive](../../../config/core/storage-drive.md), creating the file if it doesn't exist and overwriting it if it does. Use this for non-text files such as images, PDFs, or archives.

- **Action type:** `FileActionType.WriteBinaryContents`
- **On AWS:** performs an S3 `PutObject` on the drive's bucket, decoding the supplied base64 data. If a `storageDriveTier` is given, the object is written directly into that S3 storage class.

```typescript
import { askFileWriteBinaryContents } from 'quidproquo-core';

export function* askStoreAvatar(userId: string, base64Png: string) {
  yield* askFileWriteBinaryContents('user-uploads', `avatars/${userId}.png`, {
    base64Data: base64Png,
    filename: `${userId}.png`,
    mimetype: 'image/png',
  });
}
```

## Signature

```typescript
function* askFileWriteBinaryContents(
  drive: string,
  filepath: string,
  data: QPQBinaryData,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
): AskResponse<void>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `drive` | `string` | Name of the storage drive to write to — must match a drive declared with [defineStorageDrive](../../../config/core/storage-drive.md) (or one shared via its `owner` option). |
| `filepath` | `string` | Destination path within the drive, forward-slash delimited. Parent "directories" are implicit — no need to create them. |
| `data` | `QPQBinaryData` | The binary payload to write — see below. |
| `storageDriveAdvancedWriteOptions` | `StorageDriveAdvancedWriteOptions` | Optional write options — see below. |

### `QPQBinaryData`

```typescript
interface QPQBinaryData {
  base64Data: string;
  filename: string;
  mimetype?: string;
  contentDisposition?: string;
}
```

### `StorageDriveAdvancedWriteOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storageDriveTier` | `StorageDriveTier` | `REGULAR` | The [storage tier](../../../config/core/storage-drive.md#storagedrivetier) to write the file into, e.g. write archives directly to `COLD_STORAGE` without waiting for a lifecycle transition. |

## Returns

`void` — the story resumes once the write has completed.

## Errors

| Error | Meaning |
| --- | --- |
| `FileWriteBinaryContentsErrorTypeEnum.AccessDenied` | The caller lacks permission to write to this drive (e.g. a foreign drive shared without write access). |
| `FileWriteBinaryContentsErrorTypeEnum.DriveNotFound` | No storage drive with that name exists in the deployed config. |

Errors thrown by actions can be caught with `askCatch` from quidproquo-core. It returns an `EitherActionResult` — `{ success: true, result }` on success, or `{ success: false, error }` on failure:

```typescript
const outcome = yield* askCatch(
  askFileWriteBinaryContents('user-uploads', 'avatars/42.png', data),
);

if (outcome.success) {
  // written
} else {
  // outcome.error.errorType / outcome.error.errorText
}
```

## Notes

- If the drive declares an `onEvent.create` handler in [defineStorageDrive](../../../config/core/storage-drive.md#file-events-onevent), that story is triggered by this write.

## Related

- [defineStorageDrive](../../../config/core/storage-drive.md) — declares the drive, its tiers, events, and encryption.
- [askFileReadBinaryContents](./ask-file-read-binary-contents.md) — the read counterpart.
- [askFileWriteTextContents](./ask-file-write-text-contents.md) — write a UTF-8 string instead of bytes.
- [askFileGenerateTemporaryUploadSecureUrl](./ask-file-generate-temporary-upload-secure-url.md) — let a browser upload directly to the drive instead of routing bytes through your service.
- [askCreateTextQpqBinaryData](../binary-data/ask-create-text-qpq-binary-data.md) — build the `QPQBinaryData` payload from a text string.
- [askEventDocWriteAsset](../../features/event-doc/ask-event-doc-generate-asset-upload-url.md#askeventdocwriteasset) — wraps this to write a document asset server-side.
