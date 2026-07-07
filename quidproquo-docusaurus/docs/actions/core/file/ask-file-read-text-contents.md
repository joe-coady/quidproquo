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

Errors thrown by actions can be caught with `askCatch` from quidproquo-core:

```typescript
const [succeeded, contents] = yield* askCatch(askFileReadTextContents('templates', 'emails/welcome.txt'));
```

## Related

- [defineStorageDrive](../../../config/core/storage-drive.md) — declares the drive this action reads from.
- [askFileWriteTextContents](./ask-file-write-text-contents.md) — the write counterpart.
- `askFileReadObjectJson` — read + `JSON.parse` in one action.
- `askFileReadBinaryContents` — read raw bytes instead of text.
- `askFileExists` / `askFileIsColdStorage` — check before reading.
