---
sidebar_position: 3
---

# File Actions

Manage file storage and operations in a platform-agnostic way across cloud storage services and local filesystems.

## Overview

File actions provide a unified interface for file operations across different storage platforms. Whether you're using AWS S3, Google Cloud Storage, Azure Blob Storage, or local filesystem, the same code works everywhere. Files are organized into "drives" (logical storage containers) and support various storage tiers for cost optimization.

## Core Concepts

### Storage Drives

A **storage drive** is a logical container for files, similar to an S3 bucket or a filesystem directory. Drives are defined in your configuration and mapped to platform-specific implementations.

```typescript
import { defineStorageDrive } from 'quidproquo-core';

export default [
  // Simple drive
  defineStorageDrive('user-uploads'),
  
  // Drive with lifecycle rules
  defineStorageDrive('logs', {
    lifecycleRules: [{
      transitions: [
        { storageDriveTier: StorageDriveTier.OCCASIONAL_ACCESS, transitionAfterDays: 30 },
        { storageDriveTier: StorageDriveTier.COLD_STORAGE, transitionAfterDays: 90 }
      ],
      deleteAfterDays: 365
    }]
  }),
  
  // Drive with event handlers
  defineStorageDrive('images', {
    onEvent: {
      create: defineServiceFunction('processImage'),
      delete: defineServiceFunction('cleanupImageMetadata')
    }
  })
];
```

### File Paths

File paths within drives use forward slashes (`/`) as delimiters, regardless of platform:

```typescript
// Correct
'documents/reports/2024/annual.pdf'

// Incorrect
'documents\\reports\\2024\\annual.pdf'
```

### Storage Tiers

Files can be stored in different tiers for cost optimization:

- **REGULAR**: Frequently accessed data (default)
- **OCCASIONAL_ACCESS**: Infrequently accessed data
- **SINGLE_ZONE_OCCASIONAL_ACCESS**: Single-zone infrequent access
- **COLD_STORAGE**: Long-term archival
- **COLD_STORAGE_INSTANT_ACCESS**: Archival with instant retrieval
- **DEEP_COLD_STORAGE**: Rarely accessed archival
- **SMART_TIERING**: Auto-optimized based on access patterns

## Available Actions

### askFileReadTextContents

Read a text file from a storage drive.

#### Signature

```typescript
function* askFileReadTextContents(
  drive: string,
  filepath: string
): Generator<FileReadTextContentsAction, string, any>
```

#### Parameters

- **drive** (`string`): The storage drive name
- **filepath** (`string`): Path to the file within the drive

#### Returns

Returns the file contents as a string.

#### Example

```typescript
import { askFileReadTextContents } from 'quidproquo-core';

function* readConfigFile() {
  const content = yield* askFileReadTextContents('config', 'settings/app.json');
  return JSON.parse(content);
}

function* readUserDocument(userId: string, docName: string) {
  const path = `users/${userId}/documents/${docName}`;
  const content = yield* askFileReadTextContents('user-data', path);
  return content;
}
```

### askFileWriteTextContents

Write text content to a file.

#### Signature

```typescript
function* askFileWriteTextContents(
  drive: string,
  filepath: string,
  contents: string,
  options?: StorageDriveAdvancedWriteOptions
): Generator<FileWriteTextContentsAction, void, any>
```

#### Parameters

- **drive** (`string`): The storage drive name
- **filepath** (`string`): Path where the file will be written
- **contents** (`string`): The text content to write
- **options** (`StorageDriveAdvancedWriteOptions`, optional): Write options including storage tier

#### Example

```typescript
function* saveReport(reportId: string, content: string) {
  const timestamp = yield* askDateNow();
  const path = `reports/${reportId}/${timestamp}.txt`;
  
  yield* askFileWriteTextContents('reports', path, content);
  
  // Archive old reports to cold storage
  yield* askFileWriteTextContents(
    'archive',
    path,
    content,
    { storageDriveTier: StorageDriveTier.COLD_STORAGE }
  );
}
```

### askFileReadBinaryContents

Read binary file data.

#### Signature

```typescript
function* askFileReadBinaryContents(
  drive: string,
  filepath: string
): Generator<FileReadBinaryContentsAction, QPQBinaryData, any>
```

#### Returns

Returns `QPQBinaryData` containing:
- `base64`: Base64 encoded string
- `contentType`: MIME type
- `size`: File size in bytes

#### Example

```typescript
function* downloadImage(imagePath: string) {
  const binaryData = yield* askFileReadBinaryContents('images', imagePath);
  
  return {
    data: binaryData.base64,
    type: binaryData.contentType,
    size: binaryData.size
  };
}
```

### askFileWriteBinaryContents

Write binary data to a file.

#### Signature

```typescript
function* askFileWriteBinaryContents(
  drive: string,
  filepath: string,
  binaryData: QPQBinaryData,
  options?: StorageDriveAdvancedWriteOptions
): Generator<FileWriteBinaryContentsAction, void, any>
```

#### Example

```typescript
function* uploadImage(userId: string, imageData: string, contentType: string) {
  const imageId = yield* askGuidNew();
  const extension = contentType.split('/')[1];
  const path = `users/${userId}/images/${imageId}.${extension}`;
  
  const binaryData: QPQBinaryData = {
    base64: imageData,
    contentType,
    size: Buffer.from(imageData, 'base64').length
  };
  
  yield* askFileWriteBinaryContents('user-uploads', path, binaryData);
  
  return path;
}
```

### askFileReadObjectJson

Read and parse a JSON file.

#### Signature

```typescript
function* askFileReadObjectJson<T>(
  drive: string,
  filepath: string
): Generator<FileReadObjectJsonAction, T, any>
```

#### Type Parameters

- **T**: The expected type of the parsed JSON

#### Returns

Returns the parsed JSON object.

#### Example

```typescript
interface UserProfile {
  id: string;
  name: string;
  preferences: Record<string, any>;
}

function* loadUserProfile(userId: string) {
  const profile = yield* askFileReadObjectJson<UserProfile>(
    'user-data',
    `profiles/${userId}.json`
  );
  
  return profile;
}
```

### askFileWriteObjectJson

Write an object as JSON to a file.

#### Signature

```typescript
function* askFileWriteObjectJson<T>(
  drive: string,
  filepath: string,
  data: T,
  options?: StorageDriveAdvancedWriteOptions
): Generator<FileWriteObjectJsonAction, void, any>
```

#### Example

```typescript
function* saveUserPreferences(userId: string, preferences: any) {
  yield* askFileWriteObjectJson(
    'user-data',
    `preferences/${userId}.json`,
    {
      userId,
      preferences,
      updatedAt: yield* askDateNow()
    }
  );
}
```

### askFileExists

Check if a file exists.

#### Signature

```typescript
function* askFileExists(
  drive: string,
  filepath: string
): Generator<FileExistsAction, boolean, any>
```

#### Returns

Returns `true` if the file exists, `false` otherwise.

#### Example

```typescript
function* ensureFileExists(drive: string, path: string, defaultContent: string) {
  const exists = yield* askFileExists(drive, path);
  
  if (!exists) {
    yield* askFileWriteTextContents(drive, path, defaultContent);
    yield* askLogCreate('INFO', `Created default file: ${path}`);
  }
  
  return exists;
}
```

### askFileDelete

Delete a file from storage.

#### Signature

```typescript
function* askFileDelete(
  drive: string,
  filepath: string
): Generator<FileDeleteAction, void, any>
```

#### Example

```typescript
function* cleanupTempFiles(sessionId: string) {
  const tempPath = `temp/${sessionId}`;
  const files = yield* askFileListDirectory('temp', tempPath);
  
  for (const file of files.fileInfos) {
    if (!file.isDir) {
      yield* askFileDelete('temp', file.filepath);
    }
  }
  
  yield* askLogCreate('INFO', `Cleaned up ${files.fileInfos.length} temp files`);
}
```

### askFileListDirectory

List files in a directory.

#### Signature

```typescript
function* askFileListDirectory(
  drive: string,
  directoryPath: string,
  pageToken?: string
): Generator<FileListDirectoryAction, DirectoryList, any>
```

#### Parameters

- **drive** (`string`): The storage drive name
- **directoryPath** (`string`): Path to the directory
- **pageToken** (`string`, optional): Token for pagination

#### Returns

Returns a `DirectoryList` containing:
- `fileInfos`: Array of `FileInfo` objects
- `pageToken`: Token for next page (if more results exist)

Each `FileInfo` contains:
- `filepath`: Full path to the file
- `drive`: Drive name
- `isDir`: Whether it's a directory
- `hashMd5`: MD5 hash (if available)

#### Example

```typescript
function* listUserFiles(userId: string) {
  const userDir = `users/${userId}`;
  let pageToken: string | undefined;
  const allFiles: FileInfo[] = [];
  
  do {
    const listing = yield* askFileListDirectory('user-data', userDir, pageToken);
    allFiles.push(...listing.fileInfos);
    pageToken = listing.pageToken;
  } while (pageToken);
  
  return allFiles.filter(f => !f.isDir);
}
```

### askFileGenerateTemporarySecureUrl

Generate a temporary URL for downloading a file.

#### Signature

```typescript
function* askFileGenerateTemporarySecureUrl(
  drive: string,
  filepath: string,
  expirationSeconds: number
): Generator<FileGenerateTemporarySecureUrlAction, string, any>
```

#### Parameters

- **drive** (`string`): The storage drive name
- **filepath** (`string`): Path to the file
- **expirationSeconds** (`number`): URL expiration time in seconds

#### Returns

Returns a temporary signed URL for downloading the file.

#### Example

```typescript
function* getDownloadUrl(fileId: string) {
  const path = `downloads/${fileId}`;
  
  // Generate URL valid for 1 hour
  const url = yield* askFileGenerateTemporarySecureUrl(
    'protected-files',
    path,
    3600
  );
  
  // Log download request
  yield* askLogCreate('AUDIT', `Download URL generated for file: ${fileId}`);
  
  return url;
}
```

### askFileGenerateTemporaryUploadSecureUrl

Generate a temporary URL for uploading a file.

#### Signature

```typescript
function* askFileGenerateTemporaryUploadSecureUrl(
  drive: string,
  filepath: string,
  expirationSeconds: number,
  contentType?: string
): Generator<FileGenerateTemporaryUploadSecureUrlAction, string, any>
```

#### Parameters

- **drive** (`string`): The storage drive name
- **filepath** (`string`): Path where the file will be uploaded
- **expirationSeconds** (`number`): URL expiration time in seconds
- **contentType** (`string`, optional): Expected MIME type of the upload

#### Returns

Returns a temporary signed URL for uploading a file.

#### Example

```typescript
function* getUploadUrl(userId: string, fileName: string, contentType: string) {
  const uploadId = yield* askGuidNew();
  const path = `uploads/${userId}/${uploadId}/${fileName}`;
  
  // Generate upload URL valid for 15 minutes
  const url = yield* askFileGenerateTemporaryUploadSecureUrl(
    'user-uploads',
    path,
    900,
    contentType
  );
  
  // Store upload metadata
  yield* askKeyValueStoreUpsert('upload-tracking', {
    id: uploadId,
    userId,
    fileName,
    path,
    status: 'pending',
    createdAt: yield* askDateNow()
  });
  
  return { uploadId, url };
}
```

### askFileIsColdStorage

Check if a file is in cold storage.

#### Signature

```typescript
function* askFileIsColdStorage(
  drive: string,
  filepath: string
): Generator<FileIsColdStorageAction, boolean, any>
```

#### Returns

Returns `true` if the file is in cold storage, `false` otherwise.

#### Example

```typescript
function* retrieveArchive(archiveId: string) {
  const path = `archives/${archiveId}`;
  const isCold = yield* askFileIsColdStorage('long-term-storage', path);
  
  if (isCold) {
    // Initiate retrieval from cold storage
    yield* askQueueSendMessage('archive-retrieval', {
      archiveId,
      path,
      requestedAt: yield* askDateNow()
    });
    
    return {
      status: 'retrieval_initiated',
      estimatedTime: '4-6 hours'
    };
  }
  
  // File is immediately accessible
  const content = yield* askFileReadTextContents('long-term-storage', path);
  return {
    status: 'available',
    content
  };
}
```

## Usage Patterns

### File Upload Pipeline

```typescript
function* processFileUpload(
  userId: string,
  fileName: string,
  fileData: string,
  contentType: string
) {
  const uploadId = yield* askGuidNew();
  const timestamp = yield* askDateNow();
  
  // Validate file
  const binaryData: QPQBinaryData = {
    base64: fileData,
    contentType,
    size: Buffer.from(fileData, 'base64').length
  };
  
  if (binaryData.size > 10485760) { // 10MB limit
    yield* askThrowError('FILE_TOO_LARGE', 'File exceeds 10MB limit');
  }
  
  // Save original
  const originalPath = `uploads/${userId}/${uploadId}/original/${fileName}`;
  yield* askFileWriteBinaryContents('user-uploads', originalPath, binaryData);
  
  // Create thumbnail if image
  if (contentType.startsWith('image/')) {
    yield* askQueueSendMessage('image-processing', {
      uploadId,
      userId,
      originalPath
    });
  }
  
  // Save metadata
  yield* askFileWriteObjectJson('user-uploads', 
    `uploads/${userId}/${uploadId}/metadata.json`,
    {
      uploadId,
      userId,
      fileName,
      contentType,
      size: binaryData.size,
      uploadedAt: timestamp,
      status: 'processing'
    }
  );
  
  return uploadId;
}
```

### Backup and Archive

```typescript
function* archiveOldFiles(drive: string, daysOld: number) {
  const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const listing = yield* askFileListDirectory(drive, '/');
  
  for (const file of listing.fileInfos) {
    if (file.isDir) continue;
    
    // Get file metadata (implementation specific)
    const metadata = yield* askFileGetMetadata(drive, file.filepath);
    
    if (metadata.lastModified < cutoffDate) {
      // Read file
      const content = yield* askFileReadBinaryContents(drive, file.filepath);
      
      // Write to archive with cold storage
      yield* askFileWriteBinaryContents(
        'archive',
        `${drive}/${file.filepath}`,
        content,
        { storageDriveTier: StorageDriveTier.COLD_STORAGE }
      );
      
      // Delete original
      yield* askFileDelete(drive, file.filepath);
      
      yield* askLogCreate('INFO', `Archived: ${file.filepath}`);
    }
  }
}
```

### File Synchronization

```typescript
function* syncFiles(sourceDrive: string, targetDrive: string, prefix: string) {
  const sourceFiles = yield* askFileListDirectory(sourceDrive, prefix);
  const targetFiles = yield* askFileListDirectory(targetDrive, prefix);
  
  const targetMap = new Map(
    targetFiles.fileInfos.map(f => [f.filepath, f.hashMd5])
  );
  
  for (const sourceFile of sourceFiles.fileInfos) {
    if (sourceFile.isDir) continue;
    
    const targetHash = targetMap.get(sourceFile.filepath);
    
    // File doesn't exist or hash mismatch
    if (!targetHash || targetHash !== sourceFile.hashMd5) {
      const content = yield* askFileReadBinaryContents(
        sourceDrive,
        sourceFile.filepath
      );
      
      yield* askFileWriteBinaryContents(
        targetDrive,
        sourceFile.filepath,
        content
      );
      
      yield* askLogCreate('INFO', `Synced: ${sourceFile.filepath}`);
    }
  }
}
```

### Temporary File Management

```typescript
function* withTempFile<T>(
  operation: (drive: string, path: string) => Generator<any, T, any>
) {
  const tempId = yield* askGuidNew();
  const tempPath = `temp/${tempId}`;
  const drive = 'temp-storage';
  
  try {
    // Execute operation with temp file
    const result = yield* operation(drive, tempPath);
    return result;
  } finally {
    // Always cleanup
    const exists = yield* askFileExists(drive, tempPath);
    if (exists) {
      yield* askFileDelete(drive, tempPath);
    }
  }
}

// Usage
function* processWithTempFile() {
  return yield* withTempFile(function* (drive, path) {
    // Write temp data
    yield* askFileWriteTextContents(drive, path, 'temp data');
    
    // Process
    const processed = yield* askProcessFile(drive, path);
    
    return processed;
  });
}
```

## Error Handling

### Handle Missing Files

```typescript
function* readFileWithFallback(
  drive: string,
  path: string,
  defaultContent: string
) {
  const result = yield* askCatch(
    askFileReadTextContents(drive, path)
  );
  
  if (!result.success) {
    if (result.error.errorType === 'NOT_FOUND') {
      yield* askLogCreate('INFO', `File not found, using default: ${path}`);
      return defaultContent;
    }
    throw result.error;
  }
  
  return result.result;
}
```

### Retry on Storage Errors

```typescript
function* reliableFileWrite(
  drive: string,
  path: string,
  content: string
) {
  return yield* askRetry(
    function* () {
      yield* askFileWriteTextContents(drive, path, content);
    },
    3, // Max retries
    1000 // Delay between retries
  );
}
```

## Best Practices

### 1. Use Appropriate Storage Tiers

```typescript
function* storeByAccessPattern(data: any, accessFrequency: string) {
  const path = `data/${yield* askGuidNew()}.json`;
  
  const tierMap = {
    'hourly': StorageDriveTier.REGULAR,
    'daily': StorageDriveTier.REGULAR,
    'weekly': StorageDriveTier.OCCASIONAL_ACCESS,
    'monthly': StorageDriveTier.COLD_STORAGE_INSTANT_ACCESS,
    'yearly': StorageDriveTier.COLD_STORAGE,
    'archive': StorageDriveTier.DEEP_COLD_STORAGE
  };
  
  yield* askFileWriteObjectJson(
    'tiered-storage',
    path,
    data,
    { storageDriveTier: tierMap[accessFrequency] || StorageDriveTier.SMART_TIERING }
  );
}
```

### 2. Implement File Versioning

```typescript
function* saveWithVersion(drive: string, basePath: string, content: string) {
  const timestamp = yield* askDateNow();
  const version = timestamp.replace(/[:.]/g, '-');
  
  // Save versioned file
  const versionPath = `${basePath}.v${version}`;
  yield* askFileWriteTextContents(drive, versionPath, content);
  
  // Update current version pointer
  yield* askFileWriteTextContents(drive, `${basePath}.current`, versionPath);
  
  // Keep last 5 versions
  yield* cleanOldVersions(drive, basePath, 5);
  
  return versionPath;
}
```

### 3. Stream Large Files

```typescript
function* processLargeFile(drive: string, path: string) {
  // For very large files, process in chunks
  const chunkSize = 1048576; // 1MB chunks
  let offset = 0;
  
  while (true) {
    const chunk = yield* askFileReadPartial(drive, path, offset, chunkSize);
    if (!chunk || chunk.length === 0) break;
    
    yield* processChunk(chunk);
    offset += chunk.length;
  }
}
```

### 4. Validate File Types

```typescript
function* validateAndStore(
  drive: string,
  path: string,
  data: QPQBinaryData,
  allowedTypes: string[]
) {
  if (!allowedTypes.includes(data.contentType)) {
    yield* askThrowError(
      'INVALID_FILE_TYPE',
      `File type ${data.contentType} not allowed`
    );
  }
  
  // Additional validation (e.g., virus scan)
  yield* askQueueSendMessage('virus-scan', { drive, path });
  
  yield* askFileWriteBinaryContents(drive, path, data);
}
```

## Platform-Specific Implementations

### AWS
- Storage Drives → S3 Buckets
- Storage Tiers → S3 Storage Classes
- Temporary URLs → S3 Presigned URLs

### Google Cloud
- Storage Drives → Cloud Storage Buckets
- Storage Tiers → Storage Classes
- Temporary URLs → Signed URLs

### Azure
- Storage Drives → Blob Containers
- Storage Tiers → Access Tiers
- Temporary URLs → SAS URLs

### Local Development
- Storage Drives → Filesystem directories
- Storage Tiers → Simulated with metadata
- Temporary URLs → Local server endpoints

## Testing

### Unit Testing

```typescript
test('file upload flow', () => {
  const story = processFileUpload('user-123', 'test.txt', 'dGVzdA==', 'text/plain');
  
  // Generate ID
  const { value: guidAction } = story.next();
  expect(guidAction.type).toBe('Guid::New');
  
  // Get timestamp
  const { value: dateAction } = story.next('upload-456');
  expect(dateAction.type).toBe('Date::Now');
  
  // Write file
  const { value: writeAction } = story.next('2024-01-01T00:00:00Z');
  expect(writeAction.type).toBe('File::WriteBinaryContents');
  expect(writeAction.payload.drive).toBe('user-uploads');
});
```

### Integration Testing

```typescript
test('file operations', async () => {
  const runtime = createTestRuntime({
    drives: {
      'test-drive': new Map()
    }
  });
  
  // Write file
  await runtime.execute(
    askFileWriteTextContents,
    ['test-drive', 'test.txt', 'Hello World']
  );
  
  // Read file
  const content = await runtime.execute(
    askFileReadTextContents,
    ['test-drive', 'test.txt']
  );
  
  expect(content).toBe('Hello World');
  
  // Check existence
  const exists = await runtime.execute(
    askFileExists,
    ['test-drive', 'test.txt']
  );
  
  expect(exists).toBe(true);
});
```

## Related Actions

- **KeyValueStore Actions** - For structured data storage
- **Queue Actions** - For async file processing
- **Event Actions** - For file event notifications
- **Log Actions** - For file operation auditing