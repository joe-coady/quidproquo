const coreFileActionComponentMap: Record<string, string[]> = {
  ['@quidproquo-core/File/ReadTextContents']: ['askFileReadTextContents', 'drive', 'filepath'],
  ['@quidproquo-core/File/WriteTextContents']: ['askFileWriteTextContents', 'drive', 'filepath', 'data', 'storageDriveAdvancedWriteOptions'],
  ['@quidproquo-core/File/ListDirectory']: ['askFileListDirectory', 'drive', 'folderPath', 'maxFiles', 'pageToken'],
  ['@quidproquo-core/File/Exists']: ['askFileExists', 'drive', 'filepath'],
  ['@quidproquo-core/File/Delete']: ['askFileDelete', 'drive', 'filepaths'],
  ['@quidproquo-core/File/ReadBinaryContents']: ['askFileReadBinaryContents', 'drive', 'filepath'],
  ['@quidproquo-core/File/WriteBinaryContents']: ['askFileWriteBinaryContents', 'drive', 'filepath', 'data', 'storageDriveAdvancedWriteOptions'],
  ['@quidproquo-core/File/GenerateTemporarySecureUrl']: ['askFileGenerateTemporarySecureUrl', 'drive', 'filepath', 'expirationMs'],
};

export default coreFileActionComponentMap;
