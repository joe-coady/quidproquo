---
title: askFileReadTextContents
description: Read a file from a storage drive as a UTF-8 string.
---

# askFileReadTextContents

Reads the contents of a file on a [storage drive](../../../config/core/storage-drive.md) and returns it as a string.

- **Action type:** `FileActionType.ReadTextContents`

```typescript
import { askFileReadTextContents } from 'quidproquo-core';

export function* askGetWelcomeMessage() {
  const message = yield* askFileReadTextContents('templates', 'emails/welcome.txt');
  return message;
}
```

## Signature

```typescript
function* askFileReadTextContents(
  drive: string,
  filepath: string,
): AskResponse<string>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `drive` | `string` | Name of the storage drive to read from — must match a drive declared with [defineStorageDrive](../../../config/core/storage-drive.md) (or one shared via its `owner` option). |
| `filepath` | `string` | Path of the file within the drive. Always use forward slashes, e.g. `'reports/2026/summary.txt'`. |

## Returns

`string` — the full file contents, decoded as text.

## Errors

| Error | Meaning |
| --- | --- |
| `FileReadTextContentsErrorTypeEnum.InvalidStorageClass` | The file is in a cold storage tier and cannot be read directly. Check first with `askFileIsColdStorage`. |

Errors thrown by actions can be caught with `askCatch` from quidproquo-core. It returns an `EitherActionResult` — `{ success: true, result }` on success, or `{ success: false, error }` on failure:

```typescript
const outcome = yield* askCatch(askFileReadTextContents('templates', 'emails/welcome.txt'));

if (outcome.success) {
  const contents = outcome.result;
  // ...
} else {
  // outcome.error.errorType / outcome.error.errorText
}
```

## Related

- [defineStorageDrive](../../../config/core/storage-drive.md) — declares the drive this action reads from.
- [askFileWriteTextContents](./ask-file-write-text-contents.md) — the write counterpart.
- [askFileReadObjectJson](./ask-file-read-object-json.md) — read + `JSON.parse` in one action.
- [askFileReadBinaryContents](./ask-file-read-binary-contents.md) — read raw bytes instead of text.
- [askFileExists](./ask-file-exists.md) / [askFileIsColdStorage](./ask-file-is-cold-storage.md) — check before reading.
- [askFileListDirectory](./ask-file-list-directory.md) — enumerate files on the drive.
- [askFileStreamOpen](./ask-file-stream-open.md) — stream large files in chunks instead of reading them whole.
- [askDecodeJson](../json/ask-decode-json.md) — safely JSON-parse the string you just read.
