---
title: askFileReadBinaryContents
description: Read a file from a storage drive as binary data.
---

# askFileReadBinaryContents

Reads a file on a [storage drive](../../../config/core/storage-drive.md) and returns it as binary data — base64-encoded bytes plus metadata. Use this for non-text files such as images, PDFs, or archives.

- **Action type:** `FileActionType.ReadBinaryContents`
- **On AWS:** performs an S3 `GetObject` on the drive's bucket and returns the body base64-encoded.

```typescript
import { askFileReadBinaryContents } from 'quidproquo-core';

export function* askGetLogo() {
  const logo = yield* askFileReadBinaryContents('assets', 'branding/logo.png');
  // logo.base64Data, logo.filename, logo.mimetype
  return logo;
}
```

## Signature

```typescript
function* askFileReadBinaryContents(
  drive: string,
  filepath: string,
): AskResponse<QPQBinaryData>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `drive` | `string` | Name of the storage drive to read from — must match a drive declared with [defineStorageDrive](../../../config/core/storage-drive.md) (or one shared via its `owner` option). |
| `filepath` | `string` | Path of the file within the drive, forward-slash delimited. |

## Returns

`QPQBinaryData` — the file's bytes and metadata:

```typescript
interface QPQBinaryData {
  base64Data: string;
  filename: string;
  mimetype?: string;
  contentDisposition?: string;
}
```

## Errors

| Error | Meaning |
| --- | --- |
| `FileReadBinaryContentsErrorTypeEnum.InvalidStorageClass` | The file is in a cold storage tier and cannot be read directly. Check first with [askFileIsColdStorage](./ask-file-is-cold-storage.md). |
| `FileReadBinaryContentsErrorTypeEnum.FileNotFound` | No file exists at the given path. |

Errors thrown by actions can be caught with `askCatch` from quidproquo-core. It returns an `EitherActionResult` — `{ success: true, result }` on success, or `{ success: false, error }` on failure:

```typescript
const outcome = yield* askCatch(askFileReadBinaryContents('assets', 'branding/logo.png'));

if (outcome.success) {
  const data = outcome.result;
} else {
  // outcome.error.errorType / outcome.error.errorText
}
```

## Related

- [defineStorageDrive](../../../config/core/storage-drive.md) — declares the drive this action reads from.
- [askFileWriteBinaryContents](./ask-file-write-binary-contents.md) — the write counterpart.
- [askFileReadTextContents](./ask-file-read-text-contents.md) — read as a UTF-8 string instead of bytes.
- [askFileGenerateTemporarySecureUrl](./ask-file-generate-temporary-secure-url.md) — hand a client a download URL instead of routing bytes through your service.
- [askFileStreamOpen](./ask-file-stream-open.md) — stream large files in chunks instead of loading them whole.
- [askCreateTextQpqBinaryData](../binary-data/ask-create-text-qpq-binary-data.md) — build a `QPQBinaryData` payload from a text string.
