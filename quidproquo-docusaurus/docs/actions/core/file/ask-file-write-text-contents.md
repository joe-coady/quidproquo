---
title: askFileWriteTextContents
description: Write a UTF-8 string to a file on a storage drive.
---

# askFileWriteTextContents

Writes a string to a file on a [storage drive](../../../config/core/storage-drive.md), creating the file if it doesn't exist and overwriting it if it does.

- **Action type:** `FileActionType.WriteTextContents`

```typescript
import { askFileWriteTextContents } from 'quidproquo-core';

export function* askSaveReport(reportCsv: string) {
  yield* askFileWriteTextContents('reports', 'exports/monthly.csv', reportCsv);
}
```

## Signature

```typescript
function* askFileWriteTextContents(
  drive: string,
  filepath: string,
  data: string,
  storageDriveAdvancedWriteOptions?: StorageDriveAdvancedWriteOptions,
): AskResponse<void>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `drive` | `string` | Name of the storage drive to write to — must match a drive declared with [defineStorageDrive](../../../config/core/storage-drive.md) (or one shared via its `owner` option). |
| `filepath` | `string` | Destination path within the drive, forward-slash delimited. Parent "directories" are implicit — no need to create them. |
| `data` | `string` | The text content to write. |
| `storageDriveAdvancedWriteOptions` | `StorageDriveAdvancedWriteOptions` | Optional write options — see below. |

### `StorageDriveAdvancedWriteOptions`

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `storageDriveTier` | `StorageDriveTier` | `REGULAR` | The [storage tier](../../../config/core/storage-drive.md#storagedrivetier) to write the file into, e.g. write archives directly to `COLD_STORAGE` without waiting for a lifecycle transition. |

## Returns

`void` — the story resumes once the write has completed.

## Errors

| Error | Meaning |
| --- | --- |
| `FileWriteTextContentsErrorTypeEnum.AccessDenied` | The caller lacks permission to write to this drive (e.g. a foreign drive shared without write access). |
| `FileWriteTextContentsErrorTypeEnum.DriveNotFound` | No storage drive with that name exists in the deployed config. |

## Notes

- If the drive declares an `onEvent.create` handler in [defineStorageDrive](../../../config/core/storage-drive.md#file-events-onevent), that story is triggered by this write.
- Writes to a drive with `encryption: true` are encrypted at rest automatically — nothing extra is needed at the call site.

## Related

- [defineStorageDrive](../../../config/core/storage-drive.md) — declares the drive, its tiers, events, and encryption.
- [askFileReadTextContents](./ask-file-read-text-contents.md) — the read counterpart.
- `askFileWriteObjectJson` — `JSON.stringify` + write in one action.
- `askFileWriteBinaryContents` — write raw bytes instead of text.
- `askFileGenerateTemporaryUploadSecureUrl` — let a browser upload directly to the drive instead of routing bytes through your service.
